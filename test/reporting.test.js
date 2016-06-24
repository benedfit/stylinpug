var _ = require('lodash')
  , assert = require('assert')
  , chalk = require('chalk')
  , fs = require('fs')
  , reporter = require('../lib/reporter')
  , utils = require('../lib/utils')

  , fixturesPath = __dirname + '/fixtures/'

describe('reporting', function () {

  it('should report unused Stylus and Pug classes in files', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    reporter(paths, function (err, results) {
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
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'fieldset' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'epsilon' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'js-alpha' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'beta' ]) === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should report unused Stylus and Pug classes in directory', function (done) {
    var options = { config: fixturesPath + utils.configPath, verbose: true }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    reporter(fixturesPath, options, function (err, results) {
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

  it('should not report the locations of unused Stylus for ignored files', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , options =
        { ignoreFiles: [ '**/test-import.styl', '**/test-include.pug' ]
        }

    reporter(paths, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 9)
      assert.equal(results.unusedStylusCount, 4)
      assert.equal(results.unusedPugCount, 5)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'nu' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'pi' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'epsilon' ]) !== -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'theta' ]) === -1, true)
      assert.equal(results.report.indexOf('test-import.styl') === -1, true, results.report)
      assert.equal(results.report.indexOf('test-include.pug') === -1, true, results.report)
      done()
    })
  })

  it('should report blacklisted Stylus and Pug classes', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , options =
        { stylusWhitelist: [ '*' ]
        , pugWhitelist: [ '*' ]
        , stylusBlacklist: [ 'delta*' ]
        , pugBlacklist: [ 'js-*' ]
        }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-blacklisted.txt', 'utf-8')

    reporter(paths, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedPugCount, 0)
      assert.equal(results.blacklistedTotal, 5)
      assert.equal(results.blacklistedStylusCount, 2)
      assert.equal(results.blacklistedPugCount, 3)
      assert.equal(chalk.stripColor(results.report)
      , expectedReport.replace(/%dirname%/g, __dirname)
      , results.report)
      done()
    })
  })

  it('should report no unused and no blacklisted Stylus and Pug classes', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , options =
        { stylusWhitelist: [ '*' ]
        , pugWhitelist: [ '*' ]
        , verbose: true
        }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    reporter(paths, options, function (err, results) {
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

  it('should filter out Stylus classes using options.stylusWhitelist', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , options = { stylusWhitelist: [ 'delta*', 'kappa' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-styluswhitelist.txt', 'utf-8')

    reporter(paths, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 16)
      assert.equal(results.unusedStylusCount, 4)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'delta--modifier' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'kappa' ]) === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should filter out Pug classes using options.pugWhitelist', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , options = { pugWhitelist: [ 'js-*' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-pugwhitelist.txt', 'utf-8')

    reporter(paths, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 15)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 9)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'js-alpha' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'js-beta-delta' ]) === -1, true)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'js-mu' ]) === -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should report any Stylus classes matching options.stylusBlacklist', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , options = { stylusBlacklist: [ 'delta*', 'kappa' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-stylusblacklist.txt', 'utf-8')

    reporter(paths, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.blacklistedTotal, 3)
      assert.equal(results.blacklistedStylusCount, 3)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(_.findIndex(results.blacklistedStylusClasses, [ 'name', 'delta' ]) !== -1, true)
      assert.equal(_.findIndex(results.blacklistedStylusClasses, [ 'name', 'delta--modifier' ]) !== -1, true)
      assert.equal(_.findIndex(results.blacklistedStylusClasses, [ 'name', 'kappa' ]) !== -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it('should report any Pug classes matching options.pugBlacklist', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test-import.styl'
        , fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        ]
      , options = { pugBlacklist: [ 'js-*' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-pugblacklist.txt', 'utf-8')

    reporter(paths, options, function (err, results) {
      assert(!err, err)
      assert.equal(results.blacklistedTotal, 3)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 3)
      assert.equal(_.findIndex(results.blacklistedPugClasses, [ 'name', 'js-alpha' ]) !== -1, true)
      assert.equal(_.findIndex(results.blacklistedPugClasses, [ 'name', 'js-beta-delta' ]) !== -1, true)
      assert.equal(_.findIndex(results.blacklistedPugClasses, [ 'name', 'js-mu' ]) !== -1, true)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

  it.skip('should report any Pug classes found in Array and object attribute notation', function (done) {
    var paths =
        [ fixturesPath + 'class-attributes.styl'
        , fixturesPath + 'class-attributes.pug'
        ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-class-attributes.txt', 'utf-8')

    reporter(paths, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedPugCount, 0)
      assert.equal(chalk.stripColor(results.report)
        , expectedReport.replace(/%dirname%/g, __dirname)
        , results.report)
      done()
    })
  })

})
