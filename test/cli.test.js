var assert = require('assert')
  , chalk = require('chalk')
  , exec = require('child_process').exec
  , fs = require('fs')
  , package = require('../package.json')

  , fixturesPath = __dirname + '/fixtures/'

describe('cli', function () {

  function run(options, done) {
    var bin = 'node ./bin/stylperjade'
      , execOpts = { cwd: __dirname + '/../' }

    exec(bin + ' ' + options, execOpts, function (err, stdout, stderr) {
      done
        ( null
        , { err: err
          , stdout: stdout
          , stderr: stderr
          }
        )
    })
  }

  it('should output the current version number', function (done) {
    run('-V', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(result.stdout.indexOf(package.version) !== -1, true)
      done()
    })
  })

  it('should output help', function (done) {
    var message = 'Usage: stylperjade [options] <cssFiles ...> <jadeFiles ...>'

    run('-h', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(result.stdout.indexOf(message) !== -1, true)
      assert.equal(result.stdout.indexOf(package.description) !== -1, true)
      done()
    })
  })

  it('should output help if no CSS files specified', function (done) {
    var message = 'Usage: stylperjade [options] <cssFiles ...> <jadeFiles ...>'

    run('', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(result.stdout.indexOf(message) !== -1, true)
      assert.equal(result.stdout.indexOf(package.description) !== -1, true)
      done()
    })
  })

  it('should output help if no Jade files specified', function (done) {
    var message = 'Usage: stylperjade [options] <cssFiles ...> <jadeFiles ...>'

    run('**/*.css', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(result.stdout.indexOf(message) !== -1, true)
      assert.equal(result.stdout.indexOf(package.description) !== -1, true)
      done()
    })
  })

  it('should error if no CSS files found', function (done) {
    var errorMessage = 'No CSS files found'

    run('nonexistent **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(result.err)
      assert.equal(result.err.message.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stderr.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stdout, '')
      done()
    })
  })

  it('should error if no Jade files found', function (done) {
    var errorMessage = 'No Jade files found'

    run('**/test.css nonexistent', function (err, result) {
      assert(!err, err)
      assert(result.err)
      assert.equal(result.err.message.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stderr.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stdout, '')
      done()
    })
  })

  it('should error if CSS files are invalid', function (done) {
    var cssFile = 'invalid.css'
      , errorMessage = 'CSS file \'' + fixturesPath + cssFile + '\' error - '

    run('**/' + cssFile + ' **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(result.err)
      assert.equal(result.err.message.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stderr.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stdout, '')
      done()
    })
  })

  it('should error if Jade files are invalid', function (done) {
    var jadeFile = 'invalid.jade'
      , errorMessage = 'Jade file \'' + fixturesPath + jadeFile + '\' error - '

    run('**/test.css **/' + jadeFile, function (err, result) {
      assert(!err, err)
      assert(result.err)
      assert.equal(result.err.message.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stderr.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stdout, '')
      done()
    })
  })

  it('should error if options.stylperjaderc is not found', function (done) {
    var errorMessage = '.stylperjaderc not found'

    run('-c nonexistent **/test.css **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(result.err)
      assert.equal(result.err.message.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stderr.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stdout, '')
      done()
    })
  })

  it('should error if options.stylperjaderc is invalid', function (done) {
    var errorMessage = '.stylperjaderc is invalid JSON'

    run('-v -c ' + fixturesPath + 'invalid.json **/test.css **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(result.err)
      assert.equal(result.err.message.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stderr.indexOf(errorMessage) !== -1, true)
      assert.equal(result.stdout, '')
      done()
    })
  })

  it('should load config from options.stylperjaderc', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    run('-v -c ' + fixturesPath + '.stylperjaderc **/test.css **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(chalk.stripColor(result.stdout).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , result.stdout)
      done()
    })
  })

  it('should load config from .stylperjaderc in project root if no options are set', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    run('**/test.css **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stdout, '')
      assert.equal(chalk.stripColor(result.stderr).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , result.stderr)
      done()
    })
  })

  it('should load config from the .stylperjaderc in working directory when set in options', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    run('-v -C ' + fixturesPath + ' .', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(chalk.stripColor(result.stdout).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , result.stdout)
      done()
    })
  })

  it('should report the locations of unused CSS classes from all files', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    run('-v -c ' + fixturesPath + '.stylperjaderc .', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(chalk.stripColor(result.stdout).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , result.stdout)
      done()
    })
  })

  it('should report the locations of unused CSS classes using external sourcemap', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-sourcemap.txt', 'utf-8')

    run('**/test-sourcemap.css **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stdout, '')
      assert.equal(chalk.stripColor(result.stderr).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , result.stderr)
      done()
    })
  })

  it('should report the locations of unused CSS classes using inline sourcemap', function (done) {
    var expectedReport = fs.readFileSync(fixturesPath + 'expected-sourcemap.txt', 'utf-8')

    run('**/test-sourcemap-inline.css **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stdout, '')
      assert.equal(chalk.stripColor(result.stderr).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , result.stderr)
      done()
    })
  })

  it('should output silently by default', function (done) {
    run('-c ' + fixturesPath + '.stylperjaderc **/test.css **/test*.jade', function (err, result) {
      assert(!err, err)
      assert(!result.err, result.err)
      assert.equal(result.stderr, '')
      assert.equal(result.stdout, '')
      done()
    })
  })

})
