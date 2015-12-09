## v1.2.5 / 2015-12-09

### Highlights
* Refactored to remove unneeded Jade dependencies

### Changes
[v1.2.4...v1.2.5](https://github.com/benedfit/stylperjade/compare/v1.2.4...v1.2.5)

## v1.2.4 / 2015-12-01

### Highlights
* Update dependencies to make use of new jade-lexer structure

### Changes
[v1.2.3...v1.2.4](https://github.com/benedfit/stylperjade/compare/v1.2.3...v1.2.4)

## v1.2.3 / 2015-06-08

### Highlights
* Having a .stylperjaderc file in the working directory is now optional
* Improved performance of main `process` function

### Changes
[v1.2.2...v1.2.3](https://github.com/benedfit/stylperjade/compare/v1.2.2...v1.2.3)

## v1.2.2 / 2015-06-08

### Highlights
* Return correct status code when unused or blacklisted classes are found via CLI

### Changes
[v1.2.1...v1.2.1](https://github.com/benedfit/stylperjade/compare/v1.2.1...v1.2.2)

## v1.2.1 / 2015-06-08

### Highlights
* Tidied up package using `.npmignore`

### Changes
[v1.2.0...v1.2.1](https://github.com/benedfit/stylperjade/compare/v1.2.0...v1.2.1)

## v1.2.0 / 2015-06-08

### Highlights
* Added support for directives via comments in CSS and Jade files
* Fixed issues where setting `options.stylperjaderc` incorrectly set `options.cwd`

### Changes
[v1.1.0...v1.2.0](https://github.com/benedfit/stylperjade/compare/v1.1.0...v1.2.0)

## v1.1.0 / 2015-06-05

### Highlights
* CLI not supports a catch all argument e.g. `stylperjade .` to find all CSS and Jade files in the current working directory
* Current working directory can now be passed to the API and CLI via `options.cwd` and `-C, --chdir` respectively
* Success messages in `results.report` and CLI output are now hidden by default and are only exposed when `options.verbose: true` or `-v, --verbose` are passed to the API or CLI respectively
* Errors are now always reported irrespective of whether verbose output is enabled or not
* Line number are now reported for classes found in Jade `#[]` syntax blocks

### Changes
[v1.0.0...v1.1.0](https://github.com/benedfit/stylperjade/compare/v1.0.0...v1.1.0)

## v1.0.0 / 2015-05-21

### Highlights
* File name patterns can now be added to `options.ignoreFiles` to whitelist all classes found in those files
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
