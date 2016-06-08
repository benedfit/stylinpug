var _ = require('lodash')
  , assert = require('assert')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('directives', function () {

  it('should whitelist Stylus classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-styluswhitelist.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 17)
      assert.equal(results.unusedStylusCount, 5)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'delta--modifier' ]) === -1, true)
      done()
    })
  })

  it('should whitelist Jade classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-jadewhitelist.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 17)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedJadeCount, 11)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.unusedJadeClasses, [ 'name', 'epsilon' ]) === -1, true)
      done()
    })
  })

  it('should whitelist both Stylus and Jade classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-whitelist.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      done()
    })
  })

  it('should blacklist Stylus classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-stylusblacklist.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 1)
      assert.equal(results.blacklistedStylusCount, 1)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.blacklistedStylusClasses, [ 'name', 'nu' ]) !== -1, true)
      done()
    })
  })

  it('should blacklist Jade classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-jadeblacklist.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 1)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 1)
      assert.equal(_.findIndex(results.blacklistedJadeClasses, [ 'name', 'rho' ]) !== -1, true)
      done()
    })
  })

  it('should blacklist both Stylus and Jade classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-blacklist.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 2)
      assert.equal(results.blacklistedStylusCount, 1)
      assert.equal(results.blacklistedJadeCount, 1)
      assert.equal(_.findIndex(results.blacklistedStylusClasses, [ 'name', 'alpha' ]) !== -1, true)
      assert.equal(_.findIndex(results.blacklistedJadeClasses, [ 'name', 'alpha' ]) !== -1, true)
      done()
    })
  })

  it('should ignore invalid directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl' ]
      , jadeFiles =
        [ fixturesPath + 'test.jade'
        , fixturesPath + 'test-include.jade'
        , fixturesPath + 'directives.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      done()
    })
  })

})
