var assert = require('assert')
  , chalk = require('chalk')
  , exec = require('child_process').exec
  , fs = require('fs')

  , fixturesPath = __dirname + '/fixtures/'
  , fixturesDir = 'test/fixtures/'

describe('cli', function () {

  it('should error if no CSS files specified', function (done) {
    var errorMessage = 'Stylperjade: no CSS files found'

    exec
      ( 'node ./bin/stylperjade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should error if no Jade files specified', function (done) {
    var errorMessage = 'Stylperjade: no Jade files found'

    exec
      ( 'node ./bin/stylperjade **/*.css'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should error if no CSS files found', function (done) {
    var errorMessage = 'Stylperjade: no CSS files found'

    exec
      ( 'node ./bin/stylperjade nonexistent **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should error if no Jade files found', function (done) {
    var errorMessage = 'Stylperjade: no Jade files found'

    exec
      ( 'node ./bin/stylperjade **/test.css nonexistent'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should error if CSS files are invalid', function (done) {
    var cssFile = 'invalid.css'
      , errorMessage = 'Stylperjade: CSS file \'' + fixturesDir + cssFile + '\' error - '

    exec
      ( 'node ./bin/stylperjade **/' + cssFile + ' **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should error if Jade files are invalid', function (done) {
    var jadeFile = 'invalid.jade'
      , errorMessage = 'Stylperjade: Jade file \'' + fixturesDir + jadeFile + '\' error - '

    exec
      ( 'node ./bin/stylperjade **/test.css **/' + jadeFile
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should error if options.stylperjaderc is not found', function (done) {
    var errorMessage = 'Stylperjade: .stylperjaderc not found'

    exec
      ( 'node ./bin/stylperjade -c nonexistent **/test.css **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should error if options.stylperjaderc is invalid', function (done) {
    var errorMessage = 'Stylperjade: .stylperjaderc is invalid JSON'

    exec
      ( 'node ./bin/stylperjade -c ' + fixturesPath + '.stylperjaderc-invalid **/test.css **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(err)
          assert.equal(err.message.indexOf(errorMessage) !== -1, true)
          assert.equal(stderr.indexOf(errorMessage) !== -1, true)
          assert.equal(stdout, '')
          done()
        }
      )
  })

  it('should load config from options.stylperjaderc', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    exec
      ( 'node ./bin/stylperjade -c ' + fixturesPath + '.stylperjaderc-valid **/test.css **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(!err, err)
          assert.equal(chalk.stripColor(stdout.trim())
            , expectedReport.replace(/%dirname%/g, __dirname).trim()
            , stdout)
          assert.equal(stderr, '')
          done()
        }
      )
  })

  it('should load config from .stylperjaderc in project root if no options are set', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    exec
      ( 'node ./bin/stylperjade **/test.css **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(!err, err)
          assert.equal(chalk.stripColor(stdout.trim())
            , expectedReport.replace(/%dirname%/g, __dirname).trim()
            , stdout)
          assert.equal(stderr, '')
          done()
        }
      )
  })

  it('should report the locations of unused CSS classes using external sourcemap', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-sourcemap.txt', 'utf-8')

    exec
      ( 'node ./bin/stylperjade **/test-sourcemap.css **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(!err, err)
          assert.equal(chalk.stripColor(stdout.trim())
            , expectedReport.replace(/%dirname%/g, __dirname).trim()
            , stdout)
          assert.equal(stderr, '')
          done()
        }
      )
  })

  it('should report the locations of unused CSS classes using inline sourcemap', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-sourcemap.txt', 'utf-8')

    exec
      ( 'node ./bin/stylperjade **/test-sourcemap-inline.css **/test*.jade'
      , { cwd: __dirname + '/../' }
      , function (err, stdout, stderr) {
          assert(!err, err)
          assert.equal(chalk.stripColor(stdout.trim())
            , expectedReport.replace(/%dirname%/g, __dirname).trim()
            , stdout)
          assert.equal(stderr, '')
          done()
        }
      )
  })

})
