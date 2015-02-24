var assert = require('assert')
  , glob = require('glob')
  , stylperjade = require('../lib/stylperjade')

describe('stylperjade', function () {

  var fixturesPath = __dirname + '/fixtures/'

  it('should error if no CSS files specified', function (done) {
    var cssFiles = []
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, function (err, output) {
        assert.equal(output, null)
      })
    }
    , /Stylperjade: no CSS files found/)
    done()
  })

  it('should error if no Jade files specified', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ ]

    assert.throws(function () {
      stylperjade(cssFiles, jadeFiles, function (err, output) {
        assert.equal(output, null)
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

      stylperjade(cssFiles, jadeFiles, function (err, output) {
        assert(err)
        assert.equal(err, 'Stylperjade: CSS file \'nonexistent\' not found')
        assert.equal(output, null)
        done()
      })
  })

  it('should return error if no Jade files found', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ 'nonexistent' ]

      stylperjade(cssFiles, jadeFiles, function (err, output) {
        assert(err)
        assert.equal(err, 'Stylperjade: Jade file \'nonexistent\' not found')
        assert.equal(output, null)
        done()
      })
  })

  it('should return unused CSS and Jade classes', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]

    stylperjade(cssFiles, jadeFiles, function (err, output) {
      assert(!err)
      assert.equal(output.total, 9)
      assert.equal(output.cssCount, 4)
      assert.equal(output.cssClasses.indexOf('delta') !== -1, true)
      assert.equal(output.cssClasses.indexOf('bravo') === -1, true)
      assert.equal(output.jadeCount, 5)
      assert.equal(output.jadeClasses.indexOf('epsilon') !== -1, true)
      assert.equal(output.jadeClasses.indexOf('bravo') === -1, true)
      done()
    })
  })

  it('should filter out CSS classes using options.cssWhitelist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options = { cssWhitelist: [ 'delta*', 'zeta' ] }

    stylperjade(cssFiles, jadeFiles, options, function (err, output) {
      assert(!err)
      assert.equal(output.total, 6)
      assert.equal(output.cssCount, 1)
      assert.equal(output.cssClasses.indexOf('delta') === -1, true)
      assert.equal(output.cssClasses.indexOf('delta-another') === -1, true)
      assert.equal(output.cssClasses.indexOf('zeta') === -1, true)
      assert.equal(output.cssClasses.indexOf('nested') !== -1, true)
      assert.equal(output.jadeCount, 5)
      assert.equal(output.jadeClasses.indexOf('epsilon') !== -1, true)
      assert.equal(output.jadeClasses.indexOf('bravo') === -1, true)
      done()
    })
  })

  it('should filter out Jade classes using options.jadeWhitelist', function (done) {
    var cssFiles = [ fixturesPath + 'test.css' ]
      , jadeFiles = [ fixturesPath + 'test.jade' ]
      , options = { jadeWhitelist: [ 'js-*' ] }

    stylperjade(cssFiles, jadeFiles, options, function (err, output) {
      assert(!err)
      assert.equal(output.total, 6)
      assert.equal(output.cssCount, 4)
      assert.equal(output.cssClasses.indexOf('delta') !== -1, true)
      assert.equal(output.cssClasses.indexOf('bravo') === -1, true)
      assert.equal(output.jadeCount, 2)
      assert.equal(output.jadeClasses.indexOf('epsilon') !== -1, true)
      assert.equal(output.jadeClasses.indexOf('bravo') === -1, true)
      assert.equal(output.jadeClasses.indexOf('js-other-thing') === -1, true)
      assert.equal(output.jadeClasses.indexOf('js-test') === -1, true)
      assert.equal(output.jadeClasses.indexOf('js-thing-1') === -1, true)
      done()
    })
  })

  it.skip('should not error on project1 test cases', function (done) {
    var cssFiles = glob(fixturesPath + 'skip/project1/**/*.css', { sync: true })
      , jadeFiles = glob(fixturesPath + 'skip/project1/**/*.jade', { sync: true })
      , options = {}

    stylperjade(cssFiles, jadeFiles, options, function (err, output) {
      console.log(output.report)
      assert(!err)
      done()
    })
  })

  it.skip('should not error on project2 test cases', function (done) {
    var cssFiles = glob(fixturesPath + 'skip/project2/**/*.css', { sync: true })
      , jadeFiles = glob(fixturesPath + 'skip/project2/**/*.jade', { sync: true })
      , options = {}

    stylperjade(cssFiles, jadeFiles, options, function (err, output) {
      console.log(output.report)
      assert(!err)
      done()
    })
  })

  it.skip('should not error on project3 test cases', function (done) {
    var cssFiles = glob(fixturesPath + 'skip/project3/**/*.css', { sync: true })
      , jadeFiles = glob(fixturesPath + 'skip/project3/**/*.jade', { sync: true })
      , options = {}

    stylperjade(cssFiles, jadeFiles, options, function (err, output) {
      console.log(output.report)
      assert(!err)
      done()
    })
  })

})
