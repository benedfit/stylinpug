var _ = require('lodash')
  , assert = require('assert')
  , chalk = require('chalk')
  , fs = require('fs')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('config', function () {

  it('should error if options.stylperjaderc is not found', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { stylperjaderc: 'nonexistent' }

    stylperjade(stylusFiles, jadeFiles, options, function (err, results) {
      assert(err)
      assert.equal(err, '.stylperjaderc not found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if options.stylperjaderc is invalid', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { stylperjaderc: fixturesPath + 'invalid.txt' }

    stylperjade(stylusFiles, jadeFiles, options, function (err, results) {
      assert(err)
      assert.equal(err, '.stylperjaderc is invalid JSON')
      assert.equal(results, null)
      done()
    })
  })

  it('should load config from options.stylperjaderc', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , options = { stylperjaderc: fixturesPath + '.stylperjaderc', verbose: true }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    stylperjade(stylusFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should load config from .stylperjaderc in project root if no options are set', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'delta--modifier' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'kappa' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'pi' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'beta' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'fieldset' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, [ 'name', 'epsilon' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, [ 'name', 'js-alpha' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedJadeClasses, [ 'name', 'beta' ]) === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should load config from the .stylperjaderc in working directory when set in options', function (done) {
    var stylusFiles = [ 'test*.styl' ]
      , jadeFiles = [ 'test*.jade' ]
      , options = { cwd: fixturesPath, verbose: true }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    stylperjade(stylusFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should use empty config if working directory does not contain .stylperjaderc', function (done) {
    var stylusFiles = [ '**/test*.styl' ]
      , jadeFiles = [ '**/test*.jade' ]
      , options = { cwd: __dirname }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    stylperjade(stylusFiles, jadeFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

})
