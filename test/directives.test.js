var _ = require('lodash')
  , assert = require('assert')
  , reporter = require('../lib/reporter')

  , fixturesPath = __dirname + '/fixtures/'

describe('directives', function () {

  it('should whitelist Stylus classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-styluswhitelist.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 17)
      assert.equal(results.unusedStylusCount, 5)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(_.findIndex(results.unusedStylusClasses, [ 'name', 'delta--modifier' ]) === -1, true)
      done()
    })
  })

  it('should whitelist Pug classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-pugwhitelist.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 17)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 11)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(_.findIndex(results.unusedPugClasses, [ 'name', 'epsilon' ]) === -1, true)
      done()
    })
  })

  it('should whitelist both Stylus and Pug classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-whitelist.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedStylusCount, 0)
      assert.equal(results.unusedPugCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      done()
    })
  })

  it('should blacklist Stylus classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-stylusblacklist.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(results.blacklistedTotal, 1)
      assert.equal(results.blacklistedStylusCount, 1)
      assert.equal(results.blacklistedPugCount, 0)
      assert.equal(_.findIndex(results.blacklistedStylusClasses, [ 'name', 'nu' ]) !== -1, true)
      done()
    })
  })

  it('should blacklist Pug classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-pugblacklist.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(results.blacklistedTotal, 1)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 1)
      assert.equal(_.findIndex(results.blacklistedPugClasses, [ 'name', 'rho' ]) !== -1, true)
      done()
    })
  })

  it('should blacklist both Stylus and Pug classes found in directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl', fixturesPath + 'directives-blacklist.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug', fixturesPath + 'test-include.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(results.blacklistedTotal, 2)
      assert.equal(results.blacklistedStylusCount, 1)
      assert.equal(results.blacklistedPugCount, 1)
      assert.equal(_.findIndex(results.blacklistedStylusClasses, [ 'name', 'alpha' ]) !== -1, true)
      assert.equal(_.findIndex(results.blacklistedPugClasses, [ 'name', 'alpha' ]) !== -1, true)
      done()
    })
  })

  it('should ignore invalid directives', function (done) {
    var stylusFiles = [ fixturesPath + 'test*.styl' ]
      , pugFiles =
        [ fixturesPath + 'test.pug'
        , fixturesPath + 'test-include.pug'
        , fixturesPath + 'directives.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedStylusCount, 6)
      assert.equal(results.unusedPugCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedStylusCount, 0)
      assert.equal(results.blacklistedPugCount, 0)
      done()
    })
  })

})
