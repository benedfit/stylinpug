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

      var cssUnused = filterClasses(cssClasses, jadeClasses, options.cssWhitelist)
        , jadeUnused = filterClasses(jadeClasses, cssClasses, options.jadeWhitelist)
        , unusedCount = cssUnused.length + jadeUnused.length
        , hasUnused = unusedCount > 0
        , results =
        { total: unusedCount
        , cssClasses: cssUnused
        , cssCount: cssUnused.length
        , jadeClasses: jadeUnused
        , jadeCount: jadeUnused.length
        }
        , report = []

      if (hasUnused) {
        report.push(chalk.red('✘ Stylperjade: ' + unusedCount + ' Unused classes found'))

        if (cssUnused.length > 0) {
          report.push('')
          report.push(chalk.cyan(cssUnused.length + ' unused CSS classes:'))
          cssUnused.forEach(function (unused) {
            report.push('- ' + unused)
          })
        }

        if (jadeUnused.length > 0) {
          report.push('')
          report.push(chalk.cyan(jadeUnused.length + ' unused Jade classes:'))
          jadeUnused.forEach(function (unused) {
            report.push('- ' + unused)
          })
        }
      } else {
        report.push(chalk.green('✔ Stylperjade: No unused classes found'))
      }

      results.report = report.join('\n')

      return cb(null, results)
    })
  })

  function filterClasses(a, b, whitelist) {

    return _(a)
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
                jadeClasses.push(attr.val.replace(/\'/g, ''))
              // } else {
                // This will find any classes that are dynamic, or have js logic to parse before being set
                // e.g. bodyClass
                // OR slugUrl === '/' ? 'is--active' : null
                // OR article.wide ? 'summary--block--wide content-remove-gutter' : null
                // In these case I could parse the single line if and extract any single-quoted values,
                // split them on spaces and add each to the array of class names
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
