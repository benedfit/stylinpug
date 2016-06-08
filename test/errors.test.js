var assert = require('assert')
  , stylperjade = require('../lib/stylperjade')

  , fixturesPath = __dirname + '/fixtures/'

describe('error handling', function () {

  it('should error if no Stylus files specified', function (done) {
    var stylusFiles = []
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    assert.throws(function () {
      stylperjade(stylusFiles, jadeFiles, function (err, results) {
        assert(err)
        assert.equal(results, null)
      })
    }
    , /No Stylus files specified/)
    done()
  })

  it('should error if no Jade files specified', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , jadeFiles = []

    assert.throws(function () {
      stylperjade(stylusFiles, jadeFiles, function (err, results) {
        assert(err)
        assert.equal(results, null)
      })
    }
    , /No Jade files specified/)
    done()
  })

  it('should error if no callback specified', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    assert.throws(function () {
      stylperjade(stylusFiles, jadeFiles)
    }
    , /Expected a callback/)
    done()
  })

  it('should error if no Stylus files found', function (done) {
    var stylusFiles = [ 'nonexistent' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'No Stylus files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if no Jade files found', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , jadeFiles = [ 'nonexistent' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'No Jade files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if Stylus files are invalid', function (done) {
    var stylusFiles = [ fixturesPath + 'invalid.txt' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Stylus file \'' + stylusFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

  it('should error if Jade files are invalid', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , jadeFiles = [ fixturesPath + 'invalid.txt' ]

    stylperjade(stylusFiles, jadeFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Jade file \'' + jadeFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

})
