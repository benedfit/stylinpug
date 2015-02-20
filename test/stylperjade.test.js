var glob = require('glob')
  , stylperjade = require('../lib/stylperjade')
  , assert = require('assert')
  , fixturesPath = __dirname + '/fixtures/'

describe('stylperjade', function () {

  it('should not error on simple test case', function (done) {
    stylperjade([ fixturesPath + 'test.css' ], [ fixturesPath + 'test.jade' ], function (error) {
      assert(!error)
      done()
    })
  })

  it.skip('should error on complex test case', function (done) {
    var cssFiles = glob(fixturesPath + 'skip/**/*.css', { sync: true })
      , jadeFiles = glob(fixturesPath + 'skip/**/*.jade', { sync: true })

    stylperjade(cssFiles, jadeFiles, function (error) {
      assert(error)
      done()
    })
  })

})
