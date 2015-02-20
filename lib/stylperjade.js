var async = require('async')
  , fs = require('fs')
  , chalk = require('chalk')
  , cssParser = require('css-parse')
  , CssSelectorParser = require('css-selector-parser').CssSelectorParser
  , jadeWalk = require('jade-walk')
  , jadeParser = require('jade-parser')
  , jadeLexer = require('jade-lexer')
  , cssClassNames = []
  , jadeClassNames = []
  , parseSelector = new CssSelectorParser()
    .registerNestingOperators('>', '+', '~')
    .registerAttrEqualityMods('^', '$', '*', '~')

module.exports = function (cssFiles, jadeFiles, cb) {

  async.each(cssFiles, processCss, function (err) {
    if (err) return cb(err)

    async.each(jadeFiles, processJade, function (err) {
      if (err) return cb(err)

      var cssOrphans = arrayDifference(cssClassNames, jadeClassNames).sort()
        , jadeOrphans = arrayDifference(jadeClassNames, cssClassNames).sort()
        , orphanCount = cssOrphans.length + jadeOrphans.length
        , hasOrphans = orphanCount > 0
        , output = []

      if (hasOrphans) {
        output.push(chalk.red('✘ ' + orphanCount + ' Orphaned classes found'))

        if (cssOrphans.length > 0) {
          output.push('')
          output.push(chalk.cyan('Orphaned CSS classes:'))
          cssOrphans.forEach(function (orphan) {
            output.push('- ' + orphan)
          })
        }

        if (jadeOrphans.length > 0) {
          output.push('')
          output.push(chalk.cyan('Orphaned Jade classes:'))
          jadeOrphans.forEach(function (orphan) {
            output.push('- ' + orphan)
          })
        }
      } else {
        output.push(chalk.green('✔ No orphaned classes found'))
      }

      console.log(output.join('\n'))

      return cb()
    })
  })

}

function addUnique(array, value) {

  if (array.indexOf(value) === -1) {
      array.push(value)
  }

}

function arrayDifference(orig, diff) {

  var result = []
    , excludes = []
    , regexes = []

  diff.forEach(function (exclude) {
    if (exclude instanceof RegExp) {
      regexes.push(exclude)
    } else {
      excludes.push(exclude)
    }
  })

  orig.forEach(function (val) {
    if (excludes.indexOf(val) > -1) {
      return
    }

    var excluded = regexes.some(function (regex) {
      return regex.test(val)
    })

    if (!excluded) {
      result.push(val)
    }
  })

  return result

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
          addUnique(result, className)
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
        addUnique(result, className)
      })
    })
  }

}

function processCss(file, cb) {

  fs.readFile(file, 'utf8', function (err, data) {
    if (err) return cb(err)

    cssParser(data).stylesheet.rules.forEach(function (rule) {
      extractCssRules(rule, cssClassNames)
    })

    cb()
  })
}

function processJade(file, cb) {

  fs.readFile(file, 'utf8', function (err, data) {
    if (err) return cb(err)

    jadeWalk(jadeParser(jadeLexer(data)), function after(node) {
      if (node.type === 'Tag') {
        node.attrs.forEach(function (attr) {
          if (attr.name === 'class') {
            attr.val.split(' ').forEach(function (className) {
              addUnique(jadeClassNames, className.replace(/\'/g, ''))
            })
          }
        })
      }
    })

    cb()
  })

}
