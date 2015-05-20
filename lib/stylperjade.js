var _ = require('lodash')
  , async = require('async')
  , chalk = require('chalk')
  , cssParser = require('css')
  , CssSelectorParser = require('css-selector-parser').CssSelectorParser
  , fs = require('fs')
  , glob = require('glob')
  , jadeLexer = require('jade-lexer')
  , jadeParser = require('jade-parser')
  , jadeWalk = require('jade-walk')
  , minimatch = require('minimatch')
  , os = require('os')
  , path = require('path')
  , SourcemapConsumer = require('source-map').SourceMapConsumer
  , sourcemapParser = require('source-map-resolve')

JSON.minify = JSON.minify || require('jsonminify')

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

  async.parallelLimit(
    { css: function (cb) {
        async.eachLimit(options.cssFiles, os.cpus().length, processCssFile, function (err) {
          if (err) return cb(err)

          return cb(null, cssClasses)
        })
      }
    , jade: function (cb) {
        async.eachLimit(options.jadeFiles, os.cpus().length, processJadeFile, function (err) {
          if (err) return cb(err)

          return cb(null, jadeClasses)
        })
      }
    }
    , os.cpus().length
    , function (err, classes) {
        if (err)  return cb('Stylperjade: ' + err.message)

        var cssBlacklisted = filterBlacklistedClasses(classes.css, options.cssBlacklist)
          , jadeBlacklisted = filterBlacklistedClasses(classes.jade, options.jadeBlacklist)
          , blacklistedCount = cssBlacklisted.length + jadeBlacklisted.length
          , cssUnused = filterUnusedClasses(classes.css, classes.jade, options.cssWhitelist)
          , jadeUnused = filterUnusedClasses(classes.jade, classes.css, options.jadeWhitelist)
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
      }
  )

  function filterBlacklistedClasses(a, blacklist) {

    return _(a)
      .compact()
      .filter(function (foundClass) {
        return _.any(blacklist, function (blacklistClass) {
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
        // Remove any classes that exist in ignored files
        return _.any(options.ignoreFiles, function (ignoreFile) {
          var ignoreLocation = _.find(aClass.locations, function (location) {
            if (location.file) {
              return minimatch(location.file, ignoreFile)
            } else {
              return false
            }
          })

          if (ignoreLocation) {
            if (aClass.locations.length > 1) {
              // Remove location entries for ignored files
              _.remove(aClass.locations, function (location) {
                return minimatch(location.file, ignoreFile)
              })

              // Check any location entries still exist
              return aClass.locations.length === 0
            }

            return true
          }

          return false
        })
      })
      .reject(function (aClass) {
        return _.any(whitelist, function (whitelistClass) {
          if (path.extname(whitelistClass)) {
            // Remove any classes that exist in whitelisted files
            var whitelistedLocation = _.find(aClass.locations, function (location) {
              return path.basename(location.file) === whitelistClass
            })

            if (whitelistedLocation) {
              if (aClass.locations.length > 1) {
                // Remove location entries for whitelisted files
                _.remove(aClass.locations, function (location) {
                  return path.basename(location.file) === whitelistClass
                })

                // Check any location entries still exist
                return aClass.locations.length === 0
              }

              return true
            }

            return false
          } else {
            // Remove any classes that are white listed
            return minimatch(aClass.name, whitelistClass)
          }
        })
      })
      .reject(function (aClass) {
        // Remove classes that exist in both CSS and Jade files
        return _.any(b, function (bClass) {
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
              report.push('  ' + chalk.grey(location.file + ':' + location.line
                + (location.column ? ':' + location.column : '')))
            }
          })
        })
      }

    }

    return report

  }

  function loadOptions(cssPatterns, jadePatterns, options) {

    var stylperjadercFile

    if (_.isEmpty(options)) stylperjadercFile = path.resolve('.stylperjaderc')

    if (options.stylperjaderc) stylperjadercFile = options.stylperjaderc

    if (stylperjadercFile) options = parseConfigFile(stylperjadercFile)

    options = _.defaults(options
      , { cwd: ''
        , ignoreFiles: []
        , cssFiles: []
        , jadeFiles: []
        , cssWhitelist: []
        , cssBlacklist: []
        , jadeWhitelist: []
        , jadeBlacklist: []
        }
    )

    cssPatterns.forEach(function (pattern) {
      options.cssFiles = options.cssFiles.concat(glob.sync(pattern
        , { ignore: options.ignoreFiles, cwd: options.cwd }))
    })

    jadePatterns.forEach(function (pattern) {
      options.jadeFiles = options.jadeFiles.concat(glob.sync(pattern
        , { ignore: options.ignoreFiles, cwd: options.cwd }))
    })

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

    fs.readFile(file, 'utf8', function (err, data) {
      var sourcemap = parseSourcemapFile(data, file)

      try {
        cssParser.parse(data, { silent: false, source: file }).stylesheet.rules.forEach(function (rule) {
          processCssRule(rule, sourcemap)
        })
      } catch (err) {
        err.message = 'CSS file \'' + file + '\' error - ' + err.message

        return cb(err)
      }

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

    return processCssClasses(parseSelector.parse(selector), position, sourcemap)

  }

  function processJadeFile(file, cb) {

    fs.readFile(file, 'utf8', function (err, data) {
      try {
        jadeWalk(jadeParser(jadeLexer(data, file), file), function after(node) {
          if (node.type === 'Tag') {
            node.attrs.forEach(function (attr) {
              if (attr.name === 'class') {
                var sourceFile = node.filename ? path.resolve(options.cwd, node.filename) : ''

                if (!attr.escaped) {
                  // Remove single-quotes
                  pushUnique(jadeClasses, attr.val, sourceFile, node.line)
                } else {
                  // Find any single-quoted valid class names in Jade class attribute logic
                  // e.g. currentPage === '/hall-of-fame' ? 'nav-list-item--active' : ''
                  // finds; 'nav-list-item--active'
                  var regex = new RegExp(/\'\s*([_a-zA-Z]+[_a-zA-Z0-9-\s]*)\'(?!\s*\?)/g)
                    , match

                  while ((match = regex.exec(attr.val)) !== null) {
                    pushUnique(jadeClasses, match[1], sourceFile, node.line)
                  }
                }
              }
            })
          }
        })
      } catch (err) {
        err.message = 'Jade file \'' + file + '\' error - ' + err.message

        return cb(err)
      }

      cb()
    })

  }

  function pushCssClasses(classNames, position, sourcemap) {

    var file = path.resolve(options.cwd, position.source)
      , line = position.start.line
      , column = position.start.column

    if (sourcemap) {
      var sourcemapPosition = sourcemap.originalPositionFor({ 'line': line, 'column': column })

      file = path.resolve(options.cwd, sourcemapPosition.source)
      line = sourcemapPosition.line
      column = sourcemapPosition.column
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
