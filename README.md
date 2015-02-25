# Stylperjade

Pronounced: /[stʌɪl](//ssl.gstatic.com/dictionary/static/sounds/de/0/style.mp3) [pəˈreɪd](//ssl.gstatic.com/dictionary/static/sounds/de/0/parade.mp3)/ - Checks Jade against CSS, and vice versa, for unused classes.

[![Build Status](https://travis-ci.org/benedfit/stylperjade.svg)](https://travis-ci.org/benedfit/stylperjade)
[![NPM version](https://badge.fury.io/js/stylperjade.svg)](http://badge.fury.io/js/stylperjade)

> WARNING: Experimental, and [under development](https://github.com/benedfit/stylperjade/issues), don't use in a production environment.

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
Copyright (c) 2015, Ben Edwards

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
