var _ = require('lodash')
  , async = require('async')
  , chalk = require('chalk')
  , cssParser = require('css')
  , CssSelectorParser = require('css-selector-parser').CssSelectorParser
  , fs = require('fs')
  , jadeLexer = require('jade-lexer')
  , jadeParser = require('jade-parser')
  , jadeWalk = require('jade-walk')
  , minimatch = require('minimatch')
  , path = require('path')
  , SourcemapConsumer = require('source-map').SourceMapConsumer
  , sourcemapParser = require('source-map-resolve')

JSON.minify = JSON.minify || require('node-json-minify')

function process(cssFiles, jadeFiles, options, cb) {

  if (_.isFunction(options)) {
    cb = options
    options = {}
  } else if (!_.isFunction(cb)) {
    throw new TypeError('Stylperjade: expected a callback')
  }

  options = loadOptions(cssFiles, jadeFiles, options)

  if (!options.cssFiles.length) {
    throw new Error('Stylperjade: no CSS files found')
  }

  if (!options.jadeFiles.length) {
    throw new Error('Stylperjade: no Jade files found')
  }

  var cssClasses = []
    , jadeClasses = []

  async.each(options.cssFiles, processCssFile, function (err) {
    if (err) return cb('Stylperjade: ' + err.message)

    async.each(options.jadeFiles, processJadeFile, function (err) {
      if (err) return cb('Stylperjade: ' + err.message)

      var cssBlacklisted = filterBlacklistedClasses(cssClasses, options.cssBlacklist)
        , jadeBlacklisted = filterBlacklistedClasses(jadeClasses, options.jadeBlacklist)
        , blacklistedCount = cssBlacklisted.length + jadeBlacklisted.length
        , cssUnused = filterUnusedClasses(cssClasses, jadeClasses, options.cssWhitelist)
        , jadeUnused = filterUnusedClasses(jadeClasses, cssClasses, options.jadeWhitelist)
        , unusedCount = cssUnused.length + jadeUnused.length
        , results =
          { blacklistedTotal: blacklistedCount
          , blacklistedCssClasses: cssBlacklisted
          , blacklistedCssCount: cssBlacklisted.length
          , blacklistedJadeClasses: jadeBlacklisted
          , blacklistedJadeCount: jadeBlacklisted.length
          , unusedTotal: unusedCount
          , unusedCssClasses: cssUnused
          , unusedCssCount: cssUnused.length
          , unusedJadeClasses: jadeUnused
          , unusedJadeCount: jadeUnused.length
          }
        , report = generateReport
          ( 'unused'
          , unusedCount
          , cssUnused
          , jadeUnused
          , generateReport('blacklisted', blacklistedCount, cssBlacklisted, jadeBlacklisted)
          )

        results.report = report.join('\n')

      return cb(null, results)
    })
  })

  function filterBlacklistedClasses(a, blacklist) {

    return _(a)
      .compact()
      .filter(function (foundClass) {
        return _.any(blacklist, function(blacklistClass) {
          return minimatch(foundClass.name, blacklistClass)
        })
      })
      .sortBy('name')
      .value()

  }

  function filterUnusedClasses(a, b, whitelist) {

    return _(a)
      .compact()
      .reject(function (aClass) {
        return _.any(whitelist, function(whitelistClass) {
          return minimatch(aClass.name, whitelistClass)
        })
      })
      .reject(function (aClass) {
        return _.any(b, function(bClass) {
          return aClass.name === bClass.name
        })
      })
      .sortBy('name')
      .value()

  }

  function generateReport(type, count, cssClasses, jadeClasses, report) {

    report = report || []
    if (report.length > 0) report.push('')

    if (count > 0) {
      report.push(chalk.red('✘ Stylperjade: ' + count + ' ' + type + ' classes found'))
      generateFileReport(type, 'CSS', cssClasses)
      generateFileReport(type, 'Jade', jadeClasses)
    } else {
      report.push(chalk.green('✔ Stylperjade: No ' + type + ' classes found'))
    }

    function generateFileReport(type, fileType, collection) {

      if (collection.length > 0) {
        report.push('')
        report.push(chalk.cyan(collection.length + ' ' + type + ' classes found in ' + fileType + ' files:'))
        collection.forEach(function (className) {
          report.push('- ' + className.name)
          _.sortBy(className.locations, 'file').forEach(function (location) {
            if (location.file) {
              report.push('  ' + chalk.grey(location.file
                + (location.line ? ':' + location.line
                  + (location.column ? ':' + location.column : '') : '')))
            }
          })
        })
      }

    }

    return report

  }

  function loadOptions(cssFiles, jadeFiles, options) {

    var stylperjadercFile

    if (_.isEmpty(options)) stylperjadercFile = path.resolve('.stylperjaderc')

    if (options.stylperjaderc) stylperjadercFile = options.stylperjaderc

    if (stylperjadercFile) options = parseConfigFile(stylperjadercFile)

    options = _.defaults(options
      , { cwd: ''
        , cssFiles: cssFiles || []
        , jadeFiles: jadeFiles || []
        , cssWhitelist: []
        , cssBlacklist: []
        , jadeWhitelist: []
        , jadeBlacklist: []
        }
    )

    return options

  }

  function parseConfigFile(file) {

    try {
      var options = JSON.parse(JSON.minify(fs.readFileSync(file, 'utf-8')))

      options.cwd = path.dirname(file)

      return options
    } catch (err) {
      if (err.code === 'ENOENT') err.message = 'Stylperjade: .stylperjaderc not found'
      if (err instanceof SyntaxError) throw new SyntaxError('Stylperjade: .stylperjaderc is invalid JSON')
      throw err
    }

  }

  function parseSourcemapFile(data, file) {

    var sourcemap = sourcemapParser.resolveSourceMapSync(data, file, fs.readFileSync)

    if (sourcemap) return new SourcemapConsumer(sourcemap.map)

    return null

  }

  function processCssClasses(obj, position, sourcemap) {

    switch (obj.type) {
      case 'selector':
        obj.selectors.forEach(function (selector) {
          processCssClasses(selector, position, sourcemap)
        })
        break
      case 'ruleSet':
        processCssClasses(obj.rule, position, sourcemap)
        break
      case 'rule':
        if (obj.classNames) {
          pushCssClasses(obj.classNames, position, sourcemap)
        }

        if (obj.rule) {
          processCssClasses(obj.rule, position, sourcemap)
        }

        break
    }

  }

  function processCssFile(file, cb) {

    if (path.extname(file) !== '.css') return cb(new Error('CSS file \'' + file + '\' not found'))

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        if (err.code === 'ENOENT') err.message = 'CSS file \'' + file + '\' not found'
        return cb(err)
      }

      var sourcemap = parseSourcemapFile(data, file)

      cssParser.parse(data, { silent: true, source: file }).stylesheet.rules.forEach(function (rule) {
        processCssRule(rule, sourcemap)
      })

      cb()
    })

  }

  function processCssRule(rule, sourcemap) {

    if (rule.rules) {
      rule.rules.forEach(function (rule) {
        processCssRule(rule, sourcemap)
      })
    }

    if (rule.selectors) {
      rule.selectors.forEach(function (selector) {
        processCssSelector(selector, rule.position, sourcemap)
      })
    }

  }

  function processCssSelector(selector, position, sourcemap) {

    var parseSelector = new CssSelectorParser()
        .registerNestingOperators('>', '+', '~')
        .registerAttrEqualityMods('^', '$', '*', '~')

    if (selector === '@font-face' || selector === '@-ms-viewport' || selector.indexOf('*') > -1) {
      return []
    }

    return processCssClasses(parseSelector.parse(selector), position, sourcemap)

  }

  function processJadeFile(file, cb) {

    if (path.extname(file) !== '.jade') return cb(new Error('Jade file \'' + file + '\' not found'))

    fs.readFile(file, 'utf8', function (err, data) {

      if (err) {
        if (err.code === 'ENOENT') err.message = 'Jade file \'' + file + '\' not found'
        return cb(err)
      }

      jadeWalk(jadeParser(jadeLexer(data, file), file), function after(node) {
        if (node.type === 'Tag') {
          node.attrs.forEach(function (attr) {
            if (attr.name === 'class') {
              if (!attr.escaped) {
                // Remove single-quotes
                pushUnique(jadeClasses, attr.val, node.filename, node.line)
              } else {
                // Find any single-quoted valid class names in Jade class attribute logic
                // e.g. currentPage === '/hall-of-fame' ? 'nav-list-item--active' : ''
                // finds; 'nav-list-item--active'
                var regex = new RegExp(/\'\s*([_a-zA-Z]+[_a-zA-Z0-9-\s]*)\'(?!\s*\?)/g)
                  , match

                while ((match = regex.exec(attr.val)) !== null) {
                  pushUnique(jadeClasses, match[1], node.filename, node.line)
                }
              }
            }
          })
        }
      })

      cb()
    })

  }

  function pushCssClasses(classNames, position, sourcemap) {

    var file = position.source
      , line = position.start.line
      , column = position.start.column

    if (sourcemap) {
      var sourcemapPosition = sourcemap.originalPositionFor({ 'line': line, 'column': column })
      if (sourcemapPosition) {
        file = path.resolve(options.cwd, sourcemapPosition.source)
        line = sourcemapPosition.line
        column = sourcemapPosition.column
      }
    }

    classNames.forEach(function (className) {
      pushUnique(cssClasses, className, file, line, column)
    })

  }

  function pushUnique(collection, value, file, line, column) {

    var classNames = value.replace(/\'/g, '').split(' ')
      , location = { 'file': file, 'line': line, 'column': column > 1 ? column : null }

    classNames.forEach(function (className) {
      var existingClassName = _.find(collection, 'name', className)

      if (existingClassName) {
        if (!_.find(existingClassName.locations, location)) {
          existingClassName.locations.push(location)
        }
      } else {
        collection.push({ 'name': className, 'locations': [ location ] })
      }
    })

  }

}

module.exports = process
