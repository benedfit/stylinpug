var _ = require('lodash')
  , async = require('async')
  , fs = require('fs')
  , chalk = require('chalk')
  , cssParser = require('css')
  , CssSelectorParser = require('css-selector-parser').CssSelectorParser
  , jadeWalk = require('jade-walk')
  , jadeParser = require('jade-parser')
  , jadeLexer = require('jade-lexer')
  , parseSelector = new CssSelectorParser()
    .registerNestingOperators('>', '+', '~')
    .registerAttrEqualityMods('^', '$', '*', '~')
  , cssClassNames
  , jadeClassNames

module.exports = function (cssFiles, jadeFiles, options, cb) {

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

  cssClassNames = []
  jadeClassNames = []

  async.each(cssFiles, processCss, function (err) {
    if (err) return cb(err)

    async.each(jadeFiles, processJade, function (err) {
      if (err) return cb(err)

      var cssUnused = _.unique(_.difference(_.difference(cssClassNames, options.cssWhitelist), jadeClassNames)).sort()
        , jadeUnused = _.unique(_.difference(_.difference(jadeClassNames, options.jadeWhitelist), cssClassNames)).sort()
        , unusedCount = cssUnused.length + jadeUnused.length
        , hasUnused = unusedCount > 0
        , output = []

      if (hasUnused) {
        output.push(chalk.red('✘ Stylperjade: ' + unusedCount + ' Unused classes found'))

        if (cssUnused.length > 0) {
          output.push('')
          output.push(chalk.cyan(cssUnused.length + ' unused CSS classes:'))
          cssUnused.forEach(function (unused) {
            output.push('- ' + unused)
          })
        }

        if (jadeUnused.length > 0) {
          output.push('')
          output.push(chalk.cyan(jadeUnused.length + ' unused Jade classes:'))
          jadeUnused.forEach(function (unused) {
            output.push('- ' + unused)
          })
        }
      } else {
        output.push(chalk.green('✔ Stylperjade: No unused classes found'))
      }

      return cb(null, output.join('\n'))
    })
  })

}

function extractCssClasses(selector) {

  var classes = []

  if (selector === '@font-face' || selector === '@-ms-viewport') {
      return []
  }

  if (selector.indexOf('*') > -1) {
      return []
  }

  extractCssClassNames(parseSelector.parse(selector), classes)

  return classes

}

function extractCssClassNames(obj, result) {

  switch (obj.type) {
    case 'selector':

      obj.selectors.forEach(function (selector) {
        extractCssClassNames(selector, result)
      })
      break

    case 'ruleSet':

      extractCssClassNames(obj.rule, result)
      break

    case 'rule':

      if (obj.classNames) {
        obj.classNames.forEach(function (className) {
          result.push(className)
        })
      }

      if (obj.rule) {
        extractCssClassNames(obj.rule, result)
      }

      break
  }

}

function extractCssRules(rule, result) {

  if (rule.rules) {
    rule.rules.forEach(function (rule) {
      extractCssRules(rule, result)
    })
  }

  if (rule.selectors) {
    rule.selectors.forEach(function (selector) {
      extractCssClasses(selector).forEach(function (className) {
        result.push(className)
      })
    })
  }

}

function processCss(file, cb) {

  fs.readFile(file, 'utf8', function (err, data) {
    if (err) return cb(err)

    try {
      cssParser.parse(data, { silent: true, source: file }).stylesheet.rules.forEach(function (rule) {
        extractCssRules(rule, cssClassNames)
      })

      cb()
    } catch (err) {
      return cb(err)
    }
  })
}

function processJade(file, cb) {

  fs.readFile(file, 'utf8', function (err, data) {
    if (err) return cb(err)

    try {
      jadeWalk(jadeParser(jadeLexer(data)), function after(node) {
        if (node.type === 'Tag') {
          node.attrs.forEach(function (attr) {
            if (attr.name === 'class') {
              if (!attr.escaped) {
                jadeClassNames.push(attr.val.replace(/\'/g, ''))
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
    } catch (err) {
      return cb(err)
    }
  })

}
