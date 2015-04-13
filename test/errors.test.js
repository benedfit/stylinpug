var assert = require('assert')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('error handling', function () {

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
      , jadeFiles = []

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

  it('should return error if CSS files cannot be read', function (done) {
    var cssFiles = [ 'nonexistent.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'Stylperjade: CSS file \'nonexistent.css\' error - ENOENT, open \'nonexistent.css\'')
      assert.equal(results, null)
      done()
    })
  })

  it('should return error if Jade files cannot be read', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ 'nonexistent.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'Stylperjade: Jade file \'nonexistent.jade\' error - ENOENT, open \'nonexistent.jade\'')
      assert.equal(results, null)
      done()
    })
  })

  it('should return error if CSS files are invalid', function (done) {
    var cssFiles = [ fixturesPath + 'invalid.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Stylperjade: CSS file \'' + cssFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

  it('should return error if Jade files are invalid', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'invalid.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Stylperjade: Jade file \'' + jadeFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

})
