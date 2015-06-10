var assert = require('assert')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('error handling', function () {

  it('should error if no CSS files specified', function (done) {
    var cssFiles = []
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, function (err, results) {
        assert(err)
        assert.equal(results, null)
      })
    }
    , /No CSS files specified/)
    done()
  })

  it('should error if no Jade files specified', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = []

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, function (err, results) {
        assert(err)
        assert.equal(results, null)
      })
    }
    , /No Jade files specified/)
    done()
  })

  it('should error if no callback specified', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles)
    }
    , /Expected a callback/)
    done()
  })

  it('should error if no CSS files found', function (done) {
    var cssFiles = [ 'nonexistent' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'No CSS files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if no Jade files found', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ 'nonexistent' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'No Jade files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if CSS files are invalid', function (done) {
    var cssFiles = [ fixturesPath + 'invalid.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('CSS file \'' + cssFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

  it('should error if Jade files are invalid', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'invalid.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Jade file \'' + jadeFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

})
