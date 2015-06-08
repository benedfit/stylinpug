var _ = require('lodash')
  , assert = require('assert')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('directives', function () {

  it('should whitelist CSS classes found in directives', function (done) {
    var cssFiles = [ fixturesPath + 'test.css', fixturesPath + 'test-directives-csswhitelist.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 17)
      assert.equal(results.unusedCssCount, 5)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.unusedCssClasses, 'name', 'delta--modifier') === -1, true)
      done()
    })
  })

  it('should whitelist Jade classes found in directives', function (done) {
    var cssFiles = [ fixturesPath + 'test.css', fixturesPath + 'test-directives-jadewhitelist.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 17)
      assert.equal(results.unusedCssCount, 6)
      assert.equal(results.unusedJadeCount, 11)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.unusedJadeClasses, 'name', 'epsilon') === -1, true)
      done()
    })
  })

  it('should whitelist both CSS and Jade classes found in directives', function (done) {
    var cssFiles = [ fixturesPath + 'test.css', fixturesPath + 'test-directives-whitelist.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 0)
      assert.equal(results.unusedCssCount, 0)
      assert.equal(results.unusedJadeCount, 0)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      done()
    })
  })

  it('should blacklist CSS classes found in directives', function (done) {
    var cssFiles = [ fixturesPath + 'test.css', fixturesPath + 'test-directives-cssblacklist.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedCssCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 1)
      assert.equal(results.blacklistedCssCount, 1)
      assert.equal(results.blacklistedJadeCount, 0)
      assert.equal(_.findIndex(results.blacklistedCssClasses, 'name', 'nu') !== -1, true)
      done()
    })
  })

  it('should blacklist Jade classes found in directives', function (done) {
    var cssFiles = [ fixturesPath + 'test.css', fixturesPath + 'test-directives-jadeblacklist.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedCssCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 1)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 1)
      assert.equal(_.findIndex(results.blacklistedJadeClasses, 'name', 'rho') !== -1, true)
      done()
    })
  })

  it('should blacklist both CSS and Jade classes found in directives', function (done) {
    var cssFiles = [ fixturesPath + 'test.css', fixturesPath + 'test-directives-blacklist.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade', fixturesPath + 'test-include.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedCssCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 2)
      assert.equal(results.blacklistedCssCount, 1)
      assert.equal(results.blacklistedJadeCount, 1)
      assert.equal(_.findIndex(results.blacklistedCssClasses, 'name', 'alpha') !== -1, true)
      assert.equal(_.findIndex(results.blacklistedJadeClasses, 'name', 'alpha') !== -1, true)
      done()
    })
  })

  it('should ignore invalid directives', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles =
        [ fixturesPath + 'test.jade'
        , fixturesPath + 'test-include.jade'
        , fixturesPath + 'test-directives.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(!err, err)
      assert.equal(results.unusedTotal, 18)
      assert.equal(results.unusedCssCount, 6)
      assert.equal(results.unusedJadeCount, 12)
      assert.equal(results.blacklistedTotal, 0)
      assert.equal(results.blacklistedCssCount, 0)
      assert.equal(results.blacklistedJadeCount, 0)
      done()
    })
  })

})
