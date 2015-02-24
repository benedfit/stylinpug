# Stylperjade

(pronounced: <a href="http://www.fromtexttospeech.com/texttospeech_output_files/0551594001424423586/4996907.mp3" target="_blank">/stʌɪl pəˈreɪd/</a>) Checks Jade against CSS, and vice versa, for unused classes.

[![Build Status](https://travis-ci.org/benedfit/stylperjade.svg)](https://travis-ci.org/benedfit/stylperjade)
[![NPM version](https://badge.fury.io/js/stylperjade.svg)](http://badge.fury.io/js/stylperjade)

> WARNING: Very experimental, and [under development](https://github.com/benedfit/stylperjade/issues), don't use in a production environment.

## Usage

```js
var stylperjade = require('stylperjade')
  , cssFiles = [ 'my', 'array', 'of', 'CSS', 'files' ]
  , jadeFiles = [ 'my', 'array', 'of', 'Jade', 'files' ]
  , options =
    { cssWhitelist: [ '.ignore-this-class-in-css-files', '.ignore-pattern-*' ]
    , jadeWhitelist: [ '.ignore-this-class-in-jade-files', '.ignore-pattern-*' ]
    }

stylperjade(cssFiles, jadeFiles, options, function (err, results) {
  var total = results.total
    , unusedCssClasses = results.cssClasses
    , unusedCssClassCount = results.cssCount
    , unusedJadeClasses = results.jadeClasses
    , unusedJadeClassCount = results.jadeCount

  console.log(results.report)
})
```

## Credits
[Ben Edwards](https://github.com/benedfit/)

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
