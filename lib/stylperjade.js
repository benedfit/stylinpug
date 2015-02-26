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
    if (report.length > 0) report.push('')

    if (count > 0) {
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

  function processCssClasses(obj) {

    switch (obj.type) {
      case 'selector':
        obj.selectors.forEach(function (selector) {
          processCssClasses(selector)
        })
        break
      case 'ruleSet':
        processCssClasses(obj.rule)
        break
      case 'rule':
        if (obj.classNames) {
          obj.classNames.forEach(function (className) {
            cssClasses.push(className)
          })
        }

        if (obj.rule) {
          processCssClasses(obj.rule)
        }

        break
    }

  }

  function processCssFile(file, cb) {

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        if (err.code === 'ENOENT') err.message = 'CSS file \'' + file + '\' not found'
        return cb(err)
      }

      cssParser.parse(data, { silent: true, source: file }).stylesheet.rules.forEach(function (rule) {
        processCssRule(rule)
      })

      cb()
    })

  }

  function processCssRule(rule) {

    if (rule.rules) {
      rule.rules.forEach(function (rule) {
        processCssRule(rule)
      })
    }

    if (rule.selectors) {
      rule.selectors.forEach(function (selector) {
        processCssSelector(selector)
      })
    }

  }

  function processCssSelector(selector) {

    var parseSelector = new CssSelectorParser()
        .registerNestingOperators('>', '+', '~')
        .registerAttrEqualityMods('^', '$', '*', '~')

    if (selector === '@font-face' || selector === '@-ms-viewport' || selector.indexOf('*') > -1) {
      return []
    }

    return processCssClasses(parseSelector.parse(selector))

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
                // Find any single-quoted valid class names in Jade class attribute logic
                // e.g. currentPage === '/hall-of-fame' ? 'nav-list-item--active' : ''
                // finds; 'nav-list-item--active'
                var regex = new RegExp(/\'\s*([_a-zA-Z]+[_a-zA-Z0-9-\s]*)\'(?!\s*\?)/g)
                  , match

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
