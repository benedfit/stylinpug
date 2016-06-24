var assert = require('assert')
  , reporter = require('../lib/reporter')

  , fixturesPath = __dirname + '/fixtures/'

describe('error handling', function () {

  it('should error if no Stylus files specified', function (done) {
    var paths = []

    assert.throws(function () {
      reporter(paths, function (err, results) {
        assert(err)
        assert.equal(results, null)
      })
    }
    , /No paths specified/)
    done()
  })

  it('should error if no callback specified', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'test.pug'
        ]

    assert.throws(function () {
      reporter(paths)
    }
    , /Expected a callback/)
    done()
  })

  it('should error if no Stylus files found', function (done) {
    var paths =
        [ 'nonexistent.styl'
        , fixturesPath + 'test.pug'
        ]

    reporter(paths, function (err, results) {
      assert(err)
      assert.equal(err, 'No Stylus files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if no Pug files found', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , 'nonexistent.pug'
        ]

    reporter(paths, function (err, results) {
      assert(err)
      assert.equal(err, 'No Pug files found')
      assert.equal(results, null)
      done()
    })
  })

  it('should error if Stylus files are invalid', function (done) {
    var paths =
        [ fixturesPath + 'invalid.styl'
        , fixturesPath + 'test.pug'
        ]

    reporter(paths, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Stylus file \'' + paths[0] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

  it('should error if Pug files are invalid', function (done) {
    var paths =
        [ fixturesPath + 'test.styl'
        , fixturesPath + 'invalid.pug'
        ]

    reporter(paths, function (err, results) {
      assert(err)
      assert.equal(err.indexOf('Pug file \'' + paths[1] + '\' error - ') !== -1, true)
      assert.equal(results, null)
      done()
    })
  })

})
