var _ = require('lodash')
  , async = require('async')
  , chalk = require('chalk')
  , cssParser = require('css')
  , fs = require('fs')
  , jadeLexer = require('jade-lexer')
  , jadeParser = require('jade-parser')
  , jadeWalk = require('jade-walk')
  , minimatch = require('minimatch')

function process(cssFiles, jadeFiles, options, cb) {

  if (!cssFiles.length) {
    throw new Error('Stylperjade: no CSS files found')
  }

  if (!jadeFiles.length) {
    throw new Error('Stylperjade: no Jade files found')
  }

  if (_.isFunction(options)) {
    cb = options
    options = {}
  } else if (!_.isFunction(cb)) {
    throw new TypeError('Stylperjade: expected a callback')
  }

  options = _.defaults(options
    , { cssWhitelist: []
      , cssBlacklist: []
      , jadeWhitelist: []
      , jadeBlacklist: []
      }
  )

  var cssClasses = []
    , jadeClasses = []

  async.each(cssFiles, processCssFile, function (err) {
    if (err) return cb('Stylperjade: ' + err.message)

    async.each(jadeFiles, processJadeFile, function (err) {
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
      .unique()
      .filter(function (foundClass) {
        return _.any(blacklist, function(blacklistClass) {
          return minimatch(foundClass, blacklistClass)
        })
      })
      .sort()
      .value()

  }

  function filterUnusedClasses(a, b, whitelist) {

    return _(a)
      .compact()
      .unique()
      .reject(function (foundClass) {
        return _.any(whitelist, function(whitelistClass) {
          return minimatch(foundClass, whitelistClass)
        })
      })
      .difference(b)
      .sort()
      .value()

  }

  function generateReport(type, count, cssClasses, jadeClasses, report) {

    report = report || []

    if (count > 0) {
      if (report.length > 0) report.push('')
      report.push(chalk.red('✘ Stylperjade: ' + count + ' ' + type + ' classes found'))

      if (cssClasses.length > 0) {
        report.push('')
        report.push(chalk.cyan(cssClasses.length + ' ' + type + ' CSS classes:'))
        cssClasses.forEach(function (className) {
          report.push('- ' + className)
        })
      }

      if (jadeClasses.length > 0) {
        report.push('')
        report.push(chalk.cyan(jadeClasses.length + ' ' + type + ' Jade classes:'))
        jadeClasses.forEach(function (className) {
          report.push('- ' + className)
        })
      }
    } else {
      report.push(chalk.green('✔ Stylperjade: No ' + type + ' classes found'))
    }

    return report

  }

  function processCssFile(file, cb) {

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        if (err.code === 'ENOENT') err.message = 'CSS file \'' + file + '\' not found'
        return cb(err)
      }

      cssParser.parse(data, { silent: true, source: file }).stylesheet.rules.forEach(function (rule) {
        processCssRules(rule)
      })

      cb()
    })

  }

  function processCssRules(rule) {

    if (rule.selectors) {
      processCssSelectors(rule.selectors)
    } else if (rule.rules) {
      rule.rules.forEach(function (rule) {
        processCssSelectors(rule.selectors)
      })
    }

  }

  function processCssSelectors(selectors) {

    selectors.forEach(function (selector) {
      var regex = new RegExp(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g)
        , match

      while ((match = regex.exec(selector)) !== null) {
        // Remove single-quotes
        cssClasses.push(match[0].replace(/\./g, ''))
      }
    })

  }

  function processJadeFile(file, cb) {

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        if (err.code === 'ENOENT') err.message = 'Jade file \'' + file + '\' not found'
        return cb(err)
      }

      jadeWalk(jadeParser(jadeLexer(data)), function after(node) {
        if (node.type === 'Tag') {
          node.attrs.forEach(function (attr) {
            if (attr.name === 'class') {
              if (!attr.escaped) {
                // Remove single-quotes
                jadeClasses.push(attr.val.replace(/\'/g, ''))
              } else {
                // Find classes in the format 'className otherClassName'
                var regex = new RegExp(/^\'(.*)\'$/g)
                  , match

                while ((match = regex.exec(attr.val)) !== null) {
                  jadeClasses = jadeClasses.concat(match[1].split(' '))
                }

                // Find classes in ternary operators e.g. true ? 'className' : 'otherClassName'
                regex = new RegExp(/[\?\:]\s*\'(.*?)\'/g)

                while ((match = regex.exec(attr.val)) !== null) {
                  jadeClasses = jadeClasses.concat(match[1].split(' '))
                }
              }
            }
          })
        }
      })

      cb()
    })

  }

}

module.exports = process
