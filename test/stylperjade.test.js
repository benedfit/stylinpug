var glob = require('glob')
  , stylperjade = require('../lib/stylperjade')
  , assert = require('assert')
  , cssFiles = []
  , jadeFiles = []
  , fixturesPattern = __dirname + '/fixtures/**/'

describe('stylperjade', function () {

  before(function (done) {
    cssFiles = glob(fixturesPattern + '*.css', { sync: true })
    jadeFiles = glob(fixturesPattern + '*.jade', { sync: true })
    done()
  })

  it('should not error', function (done) {
    stylperjade(cssFiles, jadeFiles, function (error) {
      assert(!error)
      done()
    })
  })

})
