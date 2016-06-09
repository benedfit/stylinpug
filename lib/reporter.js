var _ = require('lodash')
  , async = require('async')
  , chalk = require('chalk')
  , fs = require('fs')
  , glob = require('multi-glob').glob
  , pugLexer = require('pug-lexer')
  , minimatch = require('minimatch')
  , os = require('os')
  , path = require('path')
  , stripJsonComments = require('strip-json-comments')
  , stylus = require('stylus')
  , StylusParser = stylus.Parser

function process (stylusFiles, pugFiles, options, cb) {

  if (_.isFunction(options)) {
    cb = options
    options = {}
  } else if (!_.isFunction(cb)) {
    throw new TypeError('Expected a callback')
  }

  if (!stylusFiles.length) throw new Error('No Stylus files specified')
  if (!pugFiles.length) throw new Error('No Pug files specified')

  try {
    options = loadOptions(options)
  } catch (err) {
    return cb(err.message)
  }

  var stylusClasses = []
    , pugClasses = []
    , directives =
      { whitelist: function (directive) {
          directives.styluswhitelist(directive)
          directives.pugwhitelist(directive)
        }
      , styluswhitelist: function (directive) { options.stylusWhitelist.push(directive.value) }
      , pugwhitelist: function (directive) { options.pugWhitelist.push(directive.value) }
      , blacklist: function (directive) {
          directives.stylusblacklist(directive)
          directives.pugblacklist(directive)
        }
      , stylusblacklist: function (directive) { options.stylusBlacklist.push(directive.value) }
      , pugblacklist: function (directive) { options.pugBlacklist.push(directive.value) }
      }
    , globOptions = { ignore: options.ignoreFiles, cwd: options.cwd }

  async.waterfall(
    [ function (cb) {
        async.parallelLimit(
          { stylus: function (cb) {
              glob(stylusFiles, globOptions, function (err, files) {
                /* istanbul ignore if */
                if (err) return cb(err)
                if (files.length === 0) return cb('No Stylus files found')

                return cb(null, files)
              })
            }
          , pug: function (cb) {
              glob(pugFiles, globOptions, function (err, files) {
                /* istanbul ignore if */
                if (err) return cb(err)
                if (files.length === 0) return cb('No Pug files found')

                return cb(null, files)
              })
            }
          }
          , os.cpus().length
          , function (err, files) {
              if (err) return cb(err)

              cb(null, files)
            }
        )
      }
    , function (files, cb) {
        async.parallelLimit(
          { stylus: function (cb) {
              async.eachLimit(files.stylus, os.cpus().length, processStylusFile, function (err) {
                if (err) return cb(err)

                return cb(null, stylusClasses)
              })
            }
          , pug: function (cb) {
              async.eachLimit(files.pug, os.cpus().length, processPugFile, function (err) {
                if (err) return cb(err)

                return cb(null, pugClasses)
              })
            }
          }
          , os.cpus().length
          , function (err, classes) {
              if (err) return cb(err)

              cb(null, classes)
            }
        )
      }
    ]
    , function (err, classes) {
        if (err) return cb(err)

        var stylusBlacklisted = filterBlacklistedClasses(classes.stylus, options.stylusBlacklist)
          , pugBlacklisted = filterBlacklistedClasses(classes.pug, options.pugBlacklist)
          , blacklistedCount = stylusBlacklisted.length + pugBlacklisted.length
          , stylusUnused = filterUnusedClasses(classes.stylus, classes.pug, options.stylusWhitelist)
          , pugUnused = filterUnusedClasses(classes.pug, classes.stylus, options.pugWhitelist)
          , unusedCount = stylusUnused.length + pugUnused.length
          , results =
            { blacklistedTotal: blacklistedCount
            , blacklistedStylusClasses: stylusBlacklisted
            , blacklistedStylusCount: stylusBlacklisted.length
            , blacklistedPugClasses: pugBlacklisted
            , blacklistedPugCount: pugBlacklisted.length
            , unusedTotal: unusedCount
            , unusedStylusClasses: stylusUnused
            , unusedStylusCount: stylusUnused.length
            , unusedPugClasses: pugUnused
            , unusedPugCount: pugUnused.length
            }
          , report = generateReport('unused'
            , unusedCount
            , stylusUnused
            , pugUnused
            , generateReport('blacklisted', blacklistedCount, stylusBlacklisted, pugBlacklisted))

        results.report = report.join('\n')

        return cb(null, results)
      }
  )

  function filterBlacklistedClasses (a, blacklist) {

    return _(a)
      .compact()
      .filter(function (foundClass) {
        return _.some(blacklist, function (blacklistClass) {
          return minimatch(foundClass.name, blacklistClass)
        })
      })
      .sortBy('name')
      .value()

  }

  function filterUnusedClasses (a, b, whitelist) {

    return _(a)
      .compact()
      .reject(function (aClass) {
        return _.some(whitelist, function (whitelistClass) {
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
        // Remove classes that exist in both Stylus and Pug files
        return _.some(b, function (bClass) {
          return aClass.name === bClass.name
        })
      })
      .sortBy('name')
      .value()

  }

  function generateReport (type, count, stylusClasses, pugClasses, report) {

    report = report || [ '' ]

    if (count > 0) {
      report.push(chalk.red('✘ ' + count + ' ' + type + ' classes found'))

      generateFileReport(type, 'Stylus', stylusClasses)
      generateFileReport(type, 'Pug', pugClasses)
      report.push('')
    } else if (options.verbose) {
      report.push(chalk.green('✔ No ' + type + ' classes found'))
      report.push('')
    }

    function generateFileReport (type, fileType, collection) {

      if (collection.length > 0) {
        report.push('')
        report.push(chalk.cyan(collection.length + ' ' + type + ' classes found in ' + fileType + ' files:'))

        collection.forEach(function (className) {
          report.push('- ' + className.name)

          _.sortBy(className.locations, 'file').forEach(function (location) {
            report.push('  ' + chalk.grey(location.file + ':' + location.line +
              (location.column ? ':' + location.column : '')))
          })
        })
      }

    }

    return report

  }

  function loadOptions (options) {

    var configFile

    if (options.config) {
      configFile = options.config
    } else {
      if (_.isEmpty(options)) {
        configFile = path.resolve('.stylperjaderc')
      } else if (options.cwd) {
        configFile = path.resolve(options.cwd, '.stylperjaderc')
      }
    }

    if (configFile) options = parseConfigFile(configFile, options)

    options = _.defaults(options
      , { cwd: path.resolve()
        , verbose: false
        , ignoreFiles: []
        , stylusWhitelist: []
        , stylusBlacklist: []
        , pugWhitelist: []
        , pugBlacklist: []
        }
    )

    return options

  }

  function parseConfigFile (file, options) {

    try {
      var parsedOptions = JSON.parse(stripJsonComments(fs.readFileSync(file, 'utf-8')))

      parsedOptions.cwd = options.cwd
      parsedOptions.verbose = options.verbose

      return parsedOptions
    } catch (err) {
      if (err instanceof SyntaxError) throw new SyntaxError('.stylperjaderc is invalid JSON')

      if (options.config && err.code === 'ENOENT') {
        throw new Error('.stylperjaderc not found')
      }

      return options
    }

  }

  function parseDirective (comment) {

    var regex = new RegExp(/^[\/\-\*\s]*stylperjade\s+(\S*)\s*:\s*(\S+)[\/\-\*\s]*$/g)
      , match
      , directive

    while ((match = regex.exec(comment)) !== null) {
      directive = { name: match[1].toLowerCase(), value: match[2] }

      processDirective(directive)
    }

  }

  function processStylusFile (file, cb) {

    file = path.resolve(options.cwd, file)

    fs.readFile(file, 'utf8', function (err, data) {
      /* istanbul ignore if */
      if (err) return cb(err)

      try {
        var nodes = new StylusParser(data).parse().nodes

        nodes.forEach(function (node) {
          processStylusNode(node)
        })
      } catch (err) {
        return cb('Stylus file \'' + file + '\' error - ' + err.message)
      }

      cb()
    })

    function processStylusNode (node) {

      var childNodes = []

      if (node instanceof stylus.nodes.Comment) {
        parseDirective(node.str)
      }

      if (node instanceof stylus.nodes.Selector) {
        processStylusSelector(node)
      }

      if (node.nodes) childNodes = childNodes.concat(node.nodes)
      if (node.block && node.block.nodes) childNodes = childNodes.concat(node.block.nodes)

      childNodes.forEach(function (childNode) {
        processStylusNode(childNode)
      })

    }

    function processStylusSelector (node) {

      var regex = /\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/
        , match = regex.exec(node.toString())

      if (match !== null) {
        pushUniqueClass(stylusClasses, match[1], file, node.lineno, node.column)
      }

    }

  }

  function processDirective (directive) {

    var isDirective = directives[directive.name]

    if (isDirective) {
      return isDirective(directive)
    }

    return null

  }

  function processPugFile (file, cb) {

    file = path.resolve(options.cwd, file)

    fs.readFile(file, 'utf8', function (err, data) {
      /* istanbul ignore if */
      if (err) return cb(err)

      try {
        var tokens = pugLexer(data, { filename: file })

        tokens.forEach(function (token) {
          if (token.type === 'comment') {
            parseDirective(token.val)
          } else if (token.type === 'class' || (token.type === 'attribute' && token.name === 'class')) {
            var sourceFile = path.resolve(options.cwd, file)
              , regex
              , match

            if (!token.mustEscape) {
              // Remove single-quotes
              pushUniqueClass(pugClasses, token.val, sourceFile, token.line)
            } else {
              // Find any single-quoted valid class names in Pug class attribute logic
              // e.g. currentPage === '/hall-of-fame' ? 'nav-list-item--active' : ''
              // finds; 'nav-list-item--active'
              regex = new RegExp(/'\s*([_a-zA-Z]+[_a-zA-Z0-9-\s]*)'(?!\s*\?)/g)

              while ((match = regex.exec(token.val)) !== null) {
                pushUniqueClass(pugClasses, match[1], sourceFile, token.line)
              }
            }
          }
        })
      } catch (err) {
        return cb('Pug file \'' + file + '\' error - ' + err.message)
      }

      cb()
    })

  }

  function pushUniqueClass (collection, value, file, line, column) {

    var classNames = value.replace(/'/g, '').split(' ')
      , location = { 'file': file, 'line': line, 'column': column >= 1 ? column : null }

    classNames.forEach(function (className) {
      var existingClassName = _.find(collection, [ 'name', className ])

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
