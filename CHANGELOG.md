## v1.0.0 / 2005-05-21

### Highlights
* File name patterns can now be added to `options.ignoreFile` to whitelist all classes found in those files
* CLI support

### Changes
[v0.3.6...v1.0.0](https://github.com/benedfit/stylperjade/compare/v0.3.6...v1.0.0)

## v0.3.6 / 2015-04-13

### Highlights
* Line numbers are now reported for nested classes in .jade files
* Unhandled errors in CSS and Jade files are now more helpfully returned
* The use of Jade tag interpolation no longer throws errors, but line number are still not reported

### Changes
[v0.3.5...v0.3.6](https://github.com/benedfit/stylperjade/compare/v0.3.5...v0.3.6)

## v0.3.5 / 2015-03-27

### Highlights
* 100% test coverage

### Changes
[v0.3.4...v0.3.5](https://github.com/benedfit/stylperjade/compare/v0.3.4...v0.3.5)

## v0.3.4 / 2015-03-12

### Highlights
* File names can now be added to `options.cssWhitelist` and `options.jadeWhitelist` to whitelist all classes found in those files

### Changes
[v0.3.3...v0.3.4](https://github.com/benedfit/stylperjade/compare/v0.3.3...v0.3.4)

## v0.3.3 / 2015-03-11

### Highlights
* Only parse source map once per CSS file, rather than on ever rule found in the stylesheet.
* Paths in `results` where source maps are used are now reported relative to the location of the `.stylperjaderc` file

### Changes
[v0.3.2...v0.3.3](https://github.com/benedfit/stylperjade/compare/v0.3.2...v0.3.3)

## v0.3.2 / 2015-03-09

### Highlights
* Pass file path to `jade-lexer` for better debugging

### Changes
[v0.3.1...v0.3.2](https://github.com/benedfit/stylperjade/compare/v0.3.1...v0.3.2)

## v0.3.1 / 2015-03-09

### Highlights
* Use source map to report location of CSS classes
* Dedupe file locations that are on the same line in `results.report`

### Changes
[v0.3.0...v0.3.1](https://github.com/benedfit/stylperjade/compare/v0.3.0...v0.3.1)

## v0.3.0 / 2015-03-05

### Highlights
* Improve format of `results.report` to include file names and line numbers
* CSS classes arrays returned in callback now contains list of file locations and line numbers

### Changes
[v0.2.13...v0.3.0](https://github.com/benedfit/stylperjade/compare/v0.2.13...v0.3.0)

## v0.2.13 / 2015-03-02

### Highlights
* Add support for comments in `.stylperjaderc` via [JSON.minify()](https://github.com/getify/JSON.minify)

### Changes
[v0.2.12...v0.2.13](https://github.com/benedfit/stylperjade/compare/v0.2.12...v0.2.13)

## v0.2.12 / 2015-03-02

### Highlights
* Add support for loading options via `.stylperjaderc` file

### Changes
[v0.2.11...v0.2.12](https://github.com/benedfit/stylperjade/compare/v0.2.11...v0.2.12)

## v0.2.11 / 2015-02-26

### Highlights
* CSS class parsing now finds classes in media queries

### Changes
[v0.2.10...v0.2.11](https://github.com/benedfit/stylperjade/compare/v0.2.10...v0.2.11)

## v0.2.10 / 2015-02-26

### Highlights
* Whitelisting and Blacklisting support
* Parsing of Jade classes found in ternary operators and other JavaScript logic lines found in Jade files
* Class pattern matching via [minimatch](https://github.com/isaacs/minimatch)

### Changes
[v0.0.1-alpha.1...v0.2.10](https://github.com/benedfit/stylperjade/compare/master@%7B6day%7D...v0.2.10)
