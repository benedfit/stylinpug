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
    throw new TypeError('Expected a callback')
  }

  options = loadOptions(cssFiles, jadeFiles, options)

  if (!options.cssFiles.length) {
    throw new Error('No CSS files found')
  }

  if (!options.jadeFiles.length) {
    throw new Error('No Jade files found')
  }

  var cssClasses = []
    , jadeClasses = []
    , directives =
      { whitelist: function (directive) {
          directives.csswhitelist(directive)
          directives.jadewhitelist(directive)
        }
      , csswhitelist: function (directive) { options.cssWhitelist.push(directive.value) }
      , jadewhitelist: function (directive) { options.jadeWhitelist.push(directive.value) }
      , blacklist: function (directive) {
          directives.cssblacklist(directive)
          directives.jadeblacklist(directive)
        }
      , cssblacklist: function (directive) { options.cssBlacklist.push(directive.value) }
      , jadeblacklist: function (directive) { options.jadeBlacklist.push(directive.value) }
      }

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
        if (err)  return cb(err.message)

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
            return minimatch(location.file, ignoreFile)
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

    report = report || [ '' ]

    if (count > 0) {
      report.push(chalk.red('✘ ' + count + ' ' + type + ' classes found'))

      generateFileReport(type, 'CSS', cssClasses)
      generateFileReport(type, 'Jade', jadeClasses)
      report.push('')
    } else if (options.verbose) {
      report.push(chalk.green('✔ No ' + type + ' classes found'))
      report.push('')
    }

    function generateFileReport(type, fileType, collection) {

      if (collection.length > 0) {
        report.push('')
        report.push(chalk.cyan(collection.length + ' ' + type + ' classes found in ' + fileType + ' files:'))

        collection.forEach(function (className) {
          report.push('- ' + className.name)

          _.sortBy(className.locations, 'file').forEach(function (location) {
            report.push('  ' + chalk.grey(location.file + ':' + location.line
              + (location.column ? ':' + location.column : '')))
          })
        })
      }

    }

    return report

  }

  function loadOptions(cssPatterns, jadePatterns, options) {

    var stylperjadercFile

    if (options.stylperjaderc) {
      stylperjadercFile = options.stylperjaderc
    } else {
      if (_.isEmpty(options)) {
        stylperjadercFile = path.resolve('.stylperjaderc')
      } else if (options.cwd) {
        stylperjadercFile = path.resolve(options.cwd, '.stylperjaderc')
      }
    }

    if (stylperjadercFile) options = parseConfigFile(stylperjadercFile, options.verbose)

    options = _.defaults(options
      , { cwd: path.resolve()
        , verbose: false
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

  function parseConfigFile(file, verbose) {

    try {
      var options = JSON.parse(JSON.minify(fs.readFileSync(file, 'utf-8')))

      options.cwd = path.dirname(file)
      options.verbose = verbose

      return options
    } catch (err) {
      if (err.code === 'ENOENT') err.message = '.stylperjaderc not found'
      if (err instanceof SyntaxError) throw new SyntaxError('.stylperjaderc is invalid JSON')

      throw err
    }

  }

  function parseDirective(comment) {

    var regex = new RegExp(/^\s*stylperjade\s+(\S*)\s*\:\s*(\S+)\s*$/g)
      , match

    while ((match = regex.exec(comment)) !== null) {
      var directive = { name: match[1].toLowerCase(), value: match[2] }

      processDirective(directive)
    }

  }

  function parseSourcemapFile(data, file) {

    var sourcemap = sourcemapParser.resolveSourceMapSync(data, file, fs.readFileSync)

    if (sourcemap) return new SourcemapConsumer(sourcemap.map)

    return null

  }

  function processCssFile(file, cb) {

    var sourcemap

    file = path.resolve(options.cwd, file)

    fs.readFile(file, 'utf8', function (err, data) {
      sourcemap = parseSourcemapFile(data, file)

      try {
        cssParser.parse(data, { silent: false, source: file }).stylesheet.rules.forEach(function (rule) {
          processCssRule(rule)
        })
      } catch (err) {
        err.message = 'CSS file \'' + file + '\' error - ' + err.message

        return cb(err)
      }

      cb()
    })

    function processCssClasses(obj, position) {

      switch (obj.type) {
        case 'ruleSet':
          processCssClasses(obj.rule, position)

          break
        case 'rule':
          if (obj.classNames) {
            pushCssClasses(obj.classNames, position)
          }

          if (obj.rule) {
            processCssClasses(obj.rule, position)
          }

          break
      }

    }

    function processCssRule(rule) {

      if (rule.comment) {
        parseDirective(rule.comment)
      }

      if (rule.rules) {
        rule.rules.forEach(function (rule) {
          processCssRule(rule)
        })
      }

      if (rule.selectors) {
        rule.selectors.forEach(function (selector) {
          processCssSelector(selector, rule.position)
        })
      }

    }

    function processCssSelector(selector, position) {

      var parseSelector = new CssSelectorParser()
          .registerNestingOperators('>', '+', '~')
          .registerAttrEqualityMods('^', '$', '*', '~')

      return processCssClasses(parseSelector.parse(selector), position)

    }

    function pushCssClasses(classNames, position) {

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
        pushUniqueClass(cssClasses, className, file, line, column)
      })

    }

  }

  function processDirective(directive) {

    var isDirective = directives[directive.name]
    if (isDirective) {
      return isDirective(directive)
    }

    return null

  }

  function processJadeFile(file, cb) {

    file = path.resolve(options.cwd, file)

    fs.readFile(file, 'utf8', function (err, data) {
      try {
        jadeWalk(jadeParser(jadeLexer(data, file), file), function after(node) {

          if (node.type === 'Comment') {
            parseDirective(node.val)
          } else if (node.type === 'Tag') {
            node.attrs.forEach(function (attr) {
              if (attr.name === 'class') {
                var sourceFile = path.resolve(options.cwd, node.filename)

                if (!attr.escaped) {
                  // Remove single-quotes
                  pushUniqueClass(jadeClasses, attr.val, sourceFile, node.line)
                } else {
                  // Find any single-quoted valid class names in Jade class attribute logic
                  // e.g. currentPage === '/hall-of-fame' ? 'nav-list-item--active' : ''
                  // finds; 'nav-list-item--active'
                  var regex = new RegExp(/\'\s*([_a-zA-Z]+[_a-zA-Z0-9-\s]*)\'(?!\s*\?)/g)
                    , match

                  while ((match = regex.exec(attr.val)) !== null) {
                    pushUniqueClass(jadeClasses, match[1], sourceFile, node.line)
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

  function pushUniqueClass(collection, value, file, line, column) {

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
