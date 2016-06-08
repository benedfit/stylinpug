var _ = require('lodash')
  , async = require('async')
  , chalk = require('chalk')
  , fs = require('fs')
  , glob = require('multi-glob').glob
  , jadeLexer = require('jade-lexer')
  , minimatch = require('minimatch')
  , os = require('os')
  , path = require('path')
  , stripJsonComments = require('strip-json-comments')
  , stylus = require('stylus')
  , StylusParser = stylus.Parser

function process (stylusFiles, jadeFiles, options, cb) {

  if (_.isFunction(options)) {
    cb = options
    options = {}
  } else if (!_.isFunction(cb)) {
    throw new TypeError('Expected a callback')
  }

  if (!stylusFiles.length) throw new Error('No Stylus files specified')
  if (!jadeFiles.length) throw new Error('No Jade files specified')

  try {
    options = loadOptions(options)
  } catch (err) {
    return cb(err.message)
  }

  var stylusClasses = []
    , jadeClasses = []
    , directives =
      { whitelist: function (directive) {
          directives.styluswhitelist(directive)
          directives.jadewhitelist(directive)
        }
      , styluswhitelist: function (directive) { options.stylusWhitelist.push(directive.value) }
      , jadewhitelist: function (directive) { options.jadeWhitelist.push(directive.value) }
      , blacklist: function (directive) {
          directives.stylusblacklist(directive)
          directives.jadeblacklist(directive)
        }
      , stylusblacklist: function (directive) { options.stylusBlacklist.push(directive.value) }
      , jadeblacklist: function (directive) { options.jadeBlacklist.push(directive.value) }
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
          , jade: function (cb) {
              glob(jadeFiles, globOptions, function (err, files) {
                /* istanbul ignore if */
                if (err) return cb(err)
                if (files.length === 0) return cb('No Jade files found')

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
          , jade: function (cb) {
              async.eachLimit(files.jade, os.cpus().length, processJadeFile, function (err) {
                if (err) return cb(err)

                return cb(null, jadeClasses)
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
          , jadeBlacklisted = filterBlacklistedClasses(classes.jade, options.jadeBlacklist)
          , blacklistedCount = stylusBlacklisted.length + jadeBlacklisted.length
          , stylusUnused = filterUnusedClasses(classes.stylus, classes.jade, options.stylusWhitelist)
          , jadeUnused = filterUnusedClasses(classes.jade, classes.stylus, options.jadeWhitelist)
          , unusedCount = stylusUnused.length + jadeUnused.length
          , results =
            { blacklistedTotal: blacklistedCount
            , blacklistedStylusClasses: stylusBlacklisted
            , blacklistedStylusCount: stylusBlacklisted.length
            , blacklistedJadeClasses: jadeBlacklisted
            , blacklistedJadeCount: jadeBlacklisted.length
            , unusedTotal: unusedCount
            , unusedStylusClasses: stylusUnused
            , unusedStylusCount: stylusUnused.length
            , unusedJadeClasses: jadeUnused
            , unusedJadeCount: jadeUnused.length
            }
          , report = generateReport('unused'
            , unusedCount
            , stylusUnused
            , jadeUnused
            , generateReport('blacklisted', blacklistedCount, stylusBlacklisted, jadeBlacklisted))

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
        // Remove classes that exist in both Stylus and Jade files
        return _.some(b, function (bClass) {
          return aClass.name === bClass.name
        })
      })
      .sortBy('name')
      .value()

  }

  function generateReport (type, count, stylusClasses, jadeClasses, report) {

    report = report || [ '' ]

    if (count > 0) {
      report.push(chalk.red('✘ ' + count + ' ' + type + ' classes found'))

      generateFileReport(type, 'Stylus', stylusClasses)
      generateFileReport(type, 'Jade', jadeClasses)
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

    if (stylperjadercFile) options = parseConfigFile(stylperjadercFile, options)

    options = _.defaults(options
      , { cwd: path.resolve()
        , verbose: false
        , ignoreFiles: []
        , stylusWhitelist: []
        , stylusBlacklist: []
        , jadeWhitelist: []
        , jadeBlacklist: []
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

      if (options.stylperjaderc && err.code === 'ENOENT') {
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

  function processJadeFile (file, cb) {

    file = path.resolve(options.cwd, file)

    fs.readFile(file, 'utf8', function (err, data) {
      /* istanbul ignore if */
      if (err) return cb(err)

      try {
        var tokens = jadeLexer(data, file)

        tokens.forEach(function (token) {
          if (token.type === 'comment') {
            parseDirective(token.val)
          } else if (token.type === 'class' || (token.type === 'attribute' && token.name === 'class')) {
            var sourceFile = path.resolve(options.cwd, file)
              , regex
              , match

            if (!token.mustEscape) {
              // Remove single-quotes
              pushUniqueClass(jadeClasses, token.val, sourceFile, token.line)
            } else {
              // Find any single-quoted valid class names in Jade class attribute logic
              // e.g. currentPage === '/hall-of-fame' ? 'nav-list-item--active' : ''
              // finds; 'nav-list-item--active'
              regex = new RegExp(/'\s*([_a-zA-Z]+[_a-zA-Z0-9-\s]*)'(?!\s*\?)/g)

              while ((match = regex.exec(token.val)) !== null) {
                pushUniqueClass(jadeClasses, match[1], sourceFile, token.line)
              }
            }
          }
        })
      } catch (err) {
        return cb('Jade file \'' + file + '\' error - ' + err.message)
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
