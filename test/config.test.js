var _ = require('lodash')
  , assert = require('assert')
  , chalk = require('chalk')
  , fs = require('fs')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('config', function () {

  it('should error if options.stylperjaderc is not found', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { stylperjaderc: 'nonexistent' }

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, options, function (err, results) {
        assert.equal(results, null)
      })
    }
    , /.stylperjaderc not found/)
    done()
  })

  it('should error if options.stylperjaderc is invalid', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { stylperjaderc: fixturesPath + 'invalid.json' }

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, options, function (err, results) {
        assert.equal(results, null)
      })
    }
    , /.stylperjaderc is invalid JSON/)
    done()
  })

  it('should load config from options.stylperjaderc', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { stylperjaderc: fixturesPath + '.stylperjaderc' }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedCssCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(chalk.stripColor(results.report.trim())
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , results.report)
      done()
    })
  })

  it('should load config from .stylperjaderc in project root if no options are set', function (done) {
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
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'fieldset') === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'epsilon') !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'js-alpha') !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'beta') === -1, true)
      assert.equal(chalk.stripColor(results.report.trim())
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , results.report)
      done()
    })
  })

  it('should load config from the .stylperjaderc in working directory when set in options', function (done) {
    var cssFiles = [ 'test.css' ]
      , jadeFiles = [ 'test*.jade' ]
      , options = { cwd: fixturesPath }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedCssCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(chalk.stripColor(results.report.trim())
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , results.report)
      done()
    })
  })

})
