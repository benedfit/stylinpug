var _ = require('lodash')
  , assert = require('assert')
  , chalk = require('chalk')
  , fs = require('fs')
  , reporter = require('../lib/reporter')

  , fixturesPath = __dirname + '/fixtures/'

describe('config', function () {

  it('should error if options.config is not found', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]
      , options = { config: 'nonexistent' }

    reporter(stylusFiles, pugFiles, options, function (err, results) {
      assert(err)
      assert.equal(err, '.stylperjaderc not found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if options.config is invalid', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]
      , options = { config: fixturesPath + 'invalid.txt' }

    reporter(stylusFiles, pugFiles, options, function (err, results) {
      assert(err)
      assert.equal(err, '.stylperjaderc is invalid JSON')
      assert.equal(results, null)
      done()
    })
  })

  it('should load config from options.config', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]
      , options = { config: fixturesPath + '.stylperjaderc', verbose: true }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    reporter(stylusFiles, pugFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedPugCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should load config from config file in project root if no options are set', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl', fixturesPath + 'test-import.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'delta--modifier' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'kappa' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'pi' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'beta' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'fieldset' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'epsilon' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'js-alpha' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'beta' ]) === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should load config from the config file in working directory when set in options', function (done) {
    var stylusFiles = [ 'test*.styl' ]
      , pugFiles = [ 'test*.pug' ]
      , options = { cwd: fixturesPath, verbose: true }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    reporter(stylusFiles, pugFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedPugCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should use empty config if working directory does not contain config file', function (done) {
    var stylusFiles = [ '**/test*.styl' ]
      , pugFiles = [ '**/test*.pug' ]
      , options = { cwd: __dirname }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    reporter(stylusFiles, pugFiles, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

})
