# Stylperjade

Pronounced: /[stʌɪl](//ssl.gstatic.com/dictionary/static/sounds/de/0/style.mp3) [pəˈreɪd](//ssl.gstatic.com/dictionary/static/sounds/de/0/parade.mp3)/ - Checks Jade against CSS, and vice versa, for unused classes.

[![build](https://img.shields.io/travis/benedfit/stylperjade.svg)](https://travis-ci.org/benedfit/stylperjade)
[![npm](https://img.shields.io/npm/v/stylperjade.svg)](https://www.npmjs.com/package/stylperjade)

## Usage

```js
var stylperjade = require('stylperjade')
  , cssFiles = [ 'my', 'array', 'of', 'CSS', 'files' ]
  , jadeFiles = [ 'my', 'array', 'of', 'Jade', 'files' ]
  , options =
    { cssWhitelist: [ '.ignore-this-class-in-css-files', '.ignore-pattern-*' ]
    , jadeWhitelist: [ '.ignore-this-class-in-jade-files', '.ignore-pattern-*' ]
    , cssBlacklist: [ '.always-report-this-class-in-css-files', '.report-pattern-*' ]
    , jadeBlacklist: [ '.always-report-this-class-in-css-files', '.report-pattern-*' ]
    }

stylperjade(cssFiles, jadeFiles, options, function (err, results) {
  var blacklistedTotal = results.blacklistedTotal
    , blacklistedCssClasses = results.blacklistedCssClasses
    , blacklistedCssCount = results.blacklistedCssCount
    , blacklistedJadeClasses = results.blacklistedJadeClasses
    , blacklistedJadeCount = results.blacklistedJadeCount
    , unusedTotal = results.unusedTotal
    , unusedCssClasses = results.unusedCssClasses
    , unusedCssCount = results.unusedCssCount
    , unusedJadeClasses = results.unusedJadeClasses
    , unusedJadeCount = results.unusedJadeCount

  console.log(results.report)
})
```

## Credits
* [Ben Edwards](https://github.com/benedfit/)

## Licence
ISC © [Ben Edwards](https://github.com/benedfit/)
