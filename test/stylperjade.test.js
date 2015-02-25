var assert = require('assert')
  , chalk = require('chalk')
  , fs = require('fs')
  , stylperjade = require('../lib/stylperjade')

describe('stylperjade', function () {

  var fixturesPath = __dirname + '/fixtures/'

  it('should error if no CSS files specified', function (done) {
    var cssFiles = []
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, function (err, results) {
        assert.equal(results, null)
      })
    }
    , /Stylperjade: no CSS files found/)
    done()
  })

  it('should error if no Jade files specified', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ ]

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, function (err, results) {
        assert.equal(results, null)
      })
    }
    , /Stylperjade: no Jade files found/)
    done()
  })

  it('should error if no callback specified', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles)
    }
    , /Stylperjade: expected a callback/)
    done()
  })

  it('should return error if no CSS files found', function (done) {
    var cssFiles = [ 'nonexistent' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

      stylperjade(cssFiles, jadeFiles, function (err, results) {
        assert(err)
        assert.equal(err, 'Stylperjade: CSS file \'nonexistent\' not found')
        assert.equal(results, null)
        done()
      })
  })

  it('should return error if no Jade files found', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ 'nonexistent' ]

      stylperjade(cssFiles, jadeFiles, function (err, results) {
        assert(err)
        assert.equal(err, 'Stylperjade: Jade file \'nonexistent\' not found')
        assert.equal(results, null)
        done()
      })
  })

  it('should report unused CSS and Jade classes', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err)
      assert.equal(results.unusedTotal, 15)
      assert.equal(results.unusedCssCount, 5)
      assert.equal(results.unusedJadeCount, 10)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(results.unusedCssClasses.indexOf('delta--modifier') !== -1, true)
      assert.equal(results.unusedCssClasses.indexOf('kappa') !== -1, true)
      assert.equal(results.unusedCssClasses.indexOf('pi') !== -1, true)
      assert.equal(results.unusedCssClasses.indexOf('beta') === -1, true)
      assert.equal(results.unusedCssClasses.indexOf('fieldset') === -1, true)
      assert.equal(results.unusedJadeClasses.indexOf('epsilon') !== -1, true)
      assert.equal(results.unusedJadeClasses.indexOf('js-alpha') !== -1, true)
      assert.equal(results.unusedJadeClasses.indexOf('beta') === -1, true)
      assert.equal(chalk.stripColor(results.report.trim()), expectedReport.trim())
      done()
    })
  })

  it('should report blacklisted CSS and Jade classes', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options =
        { cssWhitelist: [ '*' ]
        , jadeWhitelist: [ '*' ]
        , cssBlacklist: [ 'delta*' ]
        , jadeBlacklist: [ 'js-*' ]
        }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-blacklisted.txt', 'utf-8')

      stylperjade(cssFiles, jadeFiles, options, function (err, results) {
        assert(!err)
        assert.equal(results.unusedTotal, 0)
        assert.equal(results.unusedCssCount, 0)
        assert.equal(results.unusedJadeCount, 0)
        assert.equal(results.blacklistedTotal, 5)
        assert.equal(results.blacklistedCssCount, 2)
        assert.equal(results.blacklistedJadeCount, 3)
        assert.equal(chalk.stripColor(results.report.trim()), expectedReport.trim())
        done()
      })
  })

  it('should report no unused and no blacklisted CSS and Jade classes', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options =
        { cssWhitelist: [ '*' ]
        , jadeWhitelist: [ '*' ]
        }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

      stylperjade(cssFiles, jadeFiles, options, function (err, results) {
        assert(!err)
        assert.equal(results.unusedTotal, 0)
        assert.equal(results.unusedCssCount, 0)
        assert.equal(results.unusedJadeCount, 0)
        assert.equal(results.blacklistedTotal, 0)
        assert.equal(results.blacklistedCssCount, 0)
        assert.equal(results.blacklistedJadeCount, 0)
        assert.equal(chalk.stripColor(results.report.trim()), expectedReport.trim())
        done()
      })
  })

  it('should filter out CSS classes using options.cssWhitelist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options = { cssWhitelist: [ 'delta*', 'kappa' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-csswhitelist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err)
      assert.equal(results.unusedTotal, 13)
      assert.equal(results.unusedCssCount, 3)
      assert.equal(results.unusedJadeCount, 10)
      assert.equal(results.unusedCssClasses.indexOf('delta--modifier') === -1, true)
      assert.equal(results.unusedCssClasses.indexOf('kappa') === -1, true)
      assert.equal(chalk.stripColor(results.report.trim()), expectedReport.trim())
      done()
    })
  })

  it('should filter out Jade classes using options.jadeWhitelist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options = { jadeWhitelist: [ 'js-*' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-jadewhitelist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err)
      assert.equal(results.unusedTotal, 12)
      assert.equal(results.unusedCssCount, 5)
      assert.equal(results.unusedJadeCount, 7)
      assert.equal(results.unusedJadeClasses.indexOf('js-alpha') === -1, true)
      assert.equal(results.unusedJadeClasses.indexOf('js-beta-delta') === -1, true)
      assert.equal(results.unusedJadeClasses.indexOf('js-mu') === -1, true)
      assert.equal(chalk.stripColor(results.report.trim()), expectedReport.trim())
      done()
    })
  })

  it('should report any CSS classes matching options.cssBlacklist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options = { cssBlacklist: [ 'delta*', 'kappa' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-cssblacklist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err)
      assert.equal(results.blacklistedTotal, 3)
      assert.equal(results.blacklistedCssCount, 3)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(results.blacklistedCssClasses.indexOf('delta') !== -1, true)
      assert.equal(results.blacklistedCssClasses.indexOf('delta--modifier') !== -1, true)
      assert.equal(results.blacklistedCssClasses.indexOf('kappa') !== -1, true)
      assert.equal(chalk.stripColor(results.report.trim()), expectedReport.trim())
      done()
    })
  })

  it('should report any Jade classes matching options.jadeBlacklist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options = { jadeBlacklist: [ 'js-*' ] }
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-jadeblacklist.txt', 'utf-8')

    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      assert(!err)
      assert.equal(results.blacklistedTotal, 3)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 3)
      assert.equal(results.blacklistedJadeClasses.indexOf('js-alpha') !== -1, true)
      assert.equal(results.blacklistedJadeClasses.indexOf('js-beta-delta') !== -1, true)
      assert.equal(results.blacklistedJadeClasses.indexOf('js-mu') !== -1, true)
      assert.equal(chalk.stripColor(results.report.trim()), expectedReport.trim())
      done()
    })
  })

})
