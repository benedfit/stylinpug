var _ = require('lodash')
  , assert = require('assert')
  , chalk = require('chalk')
  , fs = require('fs')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('reporting', function () {

  it('should report unused CSS and Jade classes', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedCssCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'delta--modifier') !== -1, true)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'kappa') !== -1, true)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'pi') !== -1, true)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'beta') === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'fieldset') === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'epsilon') !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'js-alpha') !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'beta') === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should report the locations of unused CSS classes using external sourcemap', function (done) {
    var cssFiles = [ fixturesPath + 'test-sourcemap.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-sourcemap.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should report the locations of unused CSS classes using inline sourcemap', function (done) {
    var cssFiles = [ fixturesPath + 'test-sourcemap-inline.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-sourcemap.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should not report the locations of unused CSS for whitelisted files', function (done) {
    var cssFiles = [ fixturesPath + 'test-sourcemap-inline.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options =
      { cssWhitelist: [ 'import.styl' ]
      , jadeWhitelist: [ 'test-include.jade' ]
      }

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 9)
      assert.equal(results.unusedCssCount, 4)
      assert.equal(results.unusedJadeCount, 5)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'nu') !== -1, true)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'pi') === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'epsilon') !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'theta') === -1, true)
      assert.equal(results.report.indexOf('test-import.styl') === -1, true, results.report)
      assert.equal(results.report.indexOf('test-include.jade') === -1, true, results.report)
      done()
    })
  })

  it('should not report the locations of unused CSS for ignored files', function (done) {
    var cssFiles = [ fixturesPath + 'test-sourcemap-inline.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options =
      { ignoreFiles: [ '**/import.styl', '**/test-include.jade' ]
      }

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 9)
      assert.equal(results.unusedCssCount, 4)
      assert.equal(results.unusedJadeCount, 5)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'nu') !== -1, true)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'pi') === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'epsilon') !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'theta') === -1, true)
      assert.equal(results.report.indexOf('test-import.styl') === -1, true, results.report)
      assert.equal(results.report.indexOf('test-include.jade') === -1, true, results.report)
      done()
    })
  })

  it('should report blacklisted CSS and Jade classes', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options =
        { cssWhitelist: [ '*' ]
        , jadeWhitelist: [ '*' ]
        , cssBlacklist: [ 'delta*' ]
        , jadeBlacklist: [ 'js-*' ]
        }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-blacklisted.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedCssCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 5)
      assert.equal(results.blacklistedCssCount, 2)
      assert.equal(results.blacklistedJadeCount, 3)
      assert.equal(chalk.stripColor(results.report)
      , expectedReport.replace(/%dirname%/g, __dirname)
      , results.report)
      done()
    })
  })

  it('should report no unused and no blacklisted CSS and Jade classes', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options =
        { cssWhitelist: [ '*' ]
        , jadeWhitelist: [ '*' ]
        , verbose: true
        }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedCssCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(chalk.stripColor(results.report)
      , expectedReport.replace(/%dirname%/g, __dirname)
      , results.report)
      done()
    })
  })

  it('should filter out CSS classes using options.cssWhitelist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { cssWhitelist: [ 'delta*', 'kappa' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-csswhitelist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 16)
      assert.equal(results.unusedCssCount, 4)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'delta--modifier') === -1, true)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'kappa') === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should filter out Jade classes using options.jadeWhitelist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { jadeWhitelist: [ 'js-*' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-jadewhitelist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 15)
      assert.equal(results.unusedCssCount, 6)
      assert.equal(results.unusedJadeCount, 9)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'js-alpha') === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'js-beta-delta') === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'js-mu') === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should report any CSS classes matching options.cssBlacklist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { cssBlacklist: [ 'delta*', 'kappa' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-cssblacklist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.blacklistedTotal, 3)
      assert.equal(results.blacklistedCssCount, 3)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.blacklistedCssClasses, 'name', 'delta') !== -1, true)
      assert.equal(_.findIndex(results.blacklistedCssClasses, 'name', 'delta--modifier') !== -1, true)
      assert.equal(_.findIndex(results.blacklistedCssClasses, 'name', 'kappa') !== -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should report any Jade classes matching options.jadeBlacklist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { jadeBlacklist: [ 'js-*' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-jadeblacklist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.blacklistedTotal, 3)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 3)
      assert.equal(_.findIndex(results.blacklistedJadeClasses, 'name', 'js-alpha') !== -1, true)
      assert.equal(_.findIndex(results.blacklistedJadeClasses, 'name', 'js-beta-delta') !== -1, true)
      assert.equal(_.findIndex(results.blacklistedJadeClasses, 'name', 'js-mu') !== -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

})
