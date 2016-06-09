# Stylperjade

Pronounced: /[stʌɪl](//ssl.gstatic.com/dictionary/static/sounds/de/0/style.mp3) [pəˈreɪd](//ssl.gstatic.com/dictionary/static/sounds/de/0/parade.mp3)/ - Checks Pug against Stylus, and vice versa, for unused and blacklisted classes.

[![build status](https://img.shields.io/travis/benedfit/stylperjade/master.svg)](https://travis-ci.org/benedfit/stylperjade)
[![coverage status](https://img.shields.io/coveralls/benedfit/stylperjade/master.svg)](https://coveralls.io/github/benedfit/stylperjade)
[![dependency status](https://img.shields.io/david/benedfit/stylperjade.svg)](https://david-dm.org/benedfit/stylperjade)
[![npm](https://img.shields.io/npm/v/stylperjade.svg)](https://www.npmjs.com/package/stylperjade)

## CLI

## Installation

```shell
$ npm install stylperjade -g
```

## Usage

```shell
$ stylperjade [options] <stylusFiles...> <pugFiles...>

```

OR to find all Stylus and Pug files in current working directory

```
$ stylperjade [options] .
```

### options

* `-h, --help`: output usage information
* `-V, --version`: output the version number
* `-v, --verbose`: displays the full [visual representation](#user-content-example-report) of blacklisted and unused classes
* `-C, --chdir <path>`: change the working directory
* `-c, --config <path>`: set path to load options from. Defaults to [./.stylperjaderc](#user-content-configuration-file)

## API

### Installation

```shell
$ npm install stylperjade --save
```

### Usage

```js
var stylperjade = require('stylperjade')

  , stylusFiles = [ 'index.styl', '**/index*.styl' ]
  , pugFiles = [ 'default.pug', 'includes/header.pug' ]
  , options =
    { ignoreFiles: [ '**/footer.styl', '**/header.pug' ]
    , stylusWhitelist: [ 'js', 'no-svg', 'icon--*', 'is-*' ]
    , pugWhitelist: [ 'js-*', 'style-guide-nav' ]
    , stylusBlacklist: [ 'js-*' ]
    , pugBlacklist: []
    }

stylperjade(stylusFiles, pugFiles, options, function (err, results) {
  console.log(results.report)
})
```

### stylperjade(stylusFiles, pugFiles, [options,] callback)

#### stylusFiles

*Required*
Type: `Array`

An array of `.styl` file name patterns.

#### pugFiles

*Required*
Type: `Array`

An array of `.pug` file name patterns.

#### options

Type: `object`

| Name | Type | Description |
| --- | --- | --- |
| cwd | `string` | The alternative path to the current working directory |
| verbose | `boolean` | Displays the full [visual representation](#user-content-example-report) of blacklisted and unused classes |
| ignoreFiles | `Array` | An array of patterns for file names to ignore when they exist in `.styl` files, `.pug` files, or source map sources |
| stylusBlacklist | `Array` | An array of patterns for classes that should never exist in `.stylus` files or source map sources |
| stylusWhitelist | `Array` | An array patterns for classes to ignore when they exist in `.stylus` files or source maps sources but not in `.pug` files |
| pugBlacklist | `Array` | An array of patterns for classes that should never exist in `.pug` files |
| pugWhitelist | `Array` | An array of patterns for classes to ignore when they exist in `.pug` files but not in `.stylus` files or source map sources |
| config | `string` | The alternative path to a config file to load options from |

#### callback(error, results)

*Required*
Type: `function`

##### results

Type: `object`

| Name | Type | Description |
| --- | --- | --- |
| [blacklistedStylusClasses](#user-content-example-classes-object) | `object` | The blacklisted classes found in `.stylus` files |
| blacklistedStylusCount | `int` | The number of blacklisted classes found in `.stylus` files |
| [blacklistedPugClasses](#user-content-example-classes-object) | `object` | The blacklisted classes found in `.pug` files |
| blacklistedPugCount | `int` | The number of blacklisted classes found in `.pug` files |
| blacklistedTotal | `int` | The total number of blacklisted classes found in all files |
| [unusedStylusClasses](#user-content-example-classes-object) | `object` | The classes found that exist in `.stylus` but not `.pug` files |
| unusedStylusCount | `int` | The number of classes found that exist in `.stylus` but not `.pug` files |
| [unusedPugClasses](#user-content-example-classes-object) | `object` | The classes found that exist in `.pug` but not `.stylus` files |
| unusedPugCount | `int` | The number of classes found that exist in `.pug` but not `.stylus` files |
| unusedTotal | `int` | The total number of ununsed classes found in all files |
| [report](#user-content-example-report) | `string` | The visual representation of blacklisted and unused classes found across all files |

###### Example classes object

```json
{ "name": "style-guide-nav"
, "locations":
  [ { "file": "/path/to/.stylus/or/.pug", "line": 1, "column": 1 }
  , { "file": "/path/to/another/.stylus/or/.pug", "line": 5, "column": 3 }
  ]
}
```

###### Example report

![](example-report.png)

## Configuration file

Options can be specified in a config file ([see example](.stylperjaderc)). If no options have been specified, Stylperjade checks the current working directory to see if there is a `.stylperjaderc` file present. This can be overridden by setting `options.config` to the path of the desired configuration file:

```js
var options = { config: '/path/to/.stylperjaderc' }

stylperjade(stylusFiles, pugFiles, options, function (err, results) {
  console.log(results.report)
})
```

## Directives

The following configuration directives as supported by Stylperjade:

### styluswhitelist

Adds the specified pattern to [`options.stylusWhitelist`](#options-1)

* Stylus usage: `/* stylperjade styluswhitelist: <pattern> */`
* Pug usage: `//- stylperjade styluswhitelist: <pattern>`

### pugwhitelist

Adds the specified pattern to [`options.pugWhitelist`](#options-1)

* Stylus usage: `/* stylperjade pugwhitelist: <pattern> */`
* Pug usage: `//- stylperjade pugwhitelist: <pattern>`

### whitelist

Adds the specified pattern to both [`options.stylusWhitelist`](#options-1) and [`options.pugWhitelist`](#options-1)

* Stylus usage: `/* stylperjade whitelist: <pattern> */`
* Pug usage: `//- stylperjade whitelist: <pattern>`

### stylusblacklist

Adds the specified pattern to [`options.stylusBlacklist`](#options-1)

* Stylus usage: `/* stylperjade stylusblacklist: <pattern> */`
* Pug usage: `//- stylperjade stylusblacklist: <pattern>`

### pugblacklist

Adds the specified pattern to [`options.pugBlacklist`](#options-1)

* Stylus usage: `/* stylperjade pugblacklist: <pattern> */`
* Pug usage: `//- stylperjade pugblacklist: <pattern>`

### blacklist

Adds the specified pattern to both [`options.stylusBlacklist`](#options-1) and [`options.pugBlacklist`](#options-1)

* Stylus usage: `/* stylperjade blacklist: <pattern> */`
* Pug usage: `//- stylperjade blacklist: <pattern>`

## Licence
ISC © [Ben Edwards](https://github.com/benedfit/)
