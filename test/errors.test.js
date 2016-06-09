var assert = require('assert')
  , reporter = require('../lib/reporter')

  , fixturesPath = __dirname + '/fixtures/'

describe('error handling', function () {

  it('should error if no Stylus files specified', function (done) {
    var stylusFiles = []
      , pugFiles = [ fixturesPath + 'test.pug' ]

    assert.throws(function () {
      reporter(stylusFiles, pugFiles, function (err, results) {
        assert(err)
        assert.equal(results, null)
      })
    }
    , /No Stylus files specified/)
    done()
  })

  it('should error if no Pug files specified', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , pugFiles = []

    assert.throws(function () {
      reporter(stylusFiles, pugFiles, function (err, results) {
        assert(err)
        assert.equal(results, null)
      })
    }
    , /No Pug files specified/)
    done()
  })

  it('should error if no callback specified', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , pugFiles = [ fixturesPath + 'test.pug' ]

    assert.throws(function () {
      reporter(stylusFiles, pugFiles)
    }
    , /Expected a callback/)
    done()
  })

  it('should error if no Stylus files found', function (done) {
    var stylusFiles = [ 'nonexistent' ]
      , pugFiles = [ fixturesPath + 'test.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'No Stylus files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if no Pug files found', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , pugFiles = [ 'nonexistent' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(err)
      assert.equal(err, 'No Pug files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if Stylus files are invalid', function (done) {
    var stylusFiles = [ fixturesPath + 'invalid.txt' ]
      , pugFiles = [ fixturesPath + 'test.pug' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Stylus file \'' + stylusFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

  it('should error if Pug files are invalid', function (done) {
    var stylusFiles = [ fixturesPath + 'test.styl' ]
      , pugFiles = [ fixturesPath + 'invalid.txt' ]

    reporter(stylusFiles, pugFiles, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Pug file \'' + pugFiles[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

})
