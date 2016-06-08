var assert = require('assert')
  , bin = require.resolve('../bin/stylperjade')
  , chalk = require('chalk')
  , fs = require('fs')
  , packageDetails = require('../package.json')
  , spawn = require('child_process').spawn

  , fixturesPath = __dirname + '/fixtures/'

describe('cli', function () {

  function run (args, cb) {
    var command = [ bin ].concat(args)
      , stdout = ''
      , stderr = ''
      , node = process.execPath
      , child = spawn(node, command)

    if (child.stderr) {
      child.stderr.on('data', function (chunk) {
        stderr += chunk
      })
    }

    if (child.stdout) {
      child.stdout.on('data', function (chunk) {
        stdout += chunk
      })
    }

    child.on('error', cb)

    child.on('close', function (code) {
      cb(null, code, stdout, stderr)
    })

    return child
  }

  it('should output the current version number', function (done) {
    var args = [ '-V' ]

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(packageDetails.version) !== -1, true, stdout)
      done()
    })
  })

  it('should output help', function (done) {
    var args = [ '-h' ]
      , message = 'Usage: stylperjade [options] <stylusFiles ...> <jadeFiles ...>'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(message) !== -1, true, stdout)
      assert.equal(stdout.indexOf(packageDetails.description) !== -1, true, stdout)
      done()
    })
  })

  it('should output help if no Stylus files specified', function (done) {
    var args = [ '' ]
      , message = 'Usage: stylperjade [options] <stylusFiles ...> <jadeFiles ...>'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(message) !== -1, true, stdout)
      assert.equal(stdout.indexOf(packageDetails.description) !== -1, true, stdout)
      done()
    })
  })

  it('should output help if no Jade files specified', function (done) {
    var args = [ '**/*.styl' ]
      , message = 'Usage: stylperjade [options] <stylusFiles ...> <jadeFiles ...>'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(message) !== -1, true, stdout)
      assert.equal(stdout.indexOf(packageDetails.description) !== -1, true, stdout)
      done()
    })
  })

  it('should error if no Stylus files found', function (done) {
    var args = [ 'nonexistent', '**/test*.jade' ]
      , errorMessage = 'No Stylus files found'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if no Jade files found', function (done) {
    var args = [ '**/test*.styl', 'nonexistent' ]
      , errorMessage = 'No Jade files found'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if Stylus files are invalid', function (done) {
    var stylusFile = 'invalid.txt'
      , args = [ '**/' + stylusFile, '**/test*.jade' ]
      , errorMessage = 'Stylus file \'' + fixturesPath + stylusFile + '\' error - '

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if Jade files are invalid', function (done) {
    var jadeFile = 'invalid.txt'
      , args = [ '**/test*.styl', '**/' + jadeFile ]
      , errorMessage = 'Jade file \'' + fixturesPath + jadeFile + '\' error - '

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should handle catch-all argument for Stylus and Jade files', function (done) {
    var args = [ '-v', '-C', fixturesPath, '.' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(chalk.stripColor(stdout).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , stdout)
      done()
    })
  })

  it('should error if options.stylperjaderc is not found', function (done) {
    var args = [ '-c', 'nonexistent', '**/test*.styl', '**/test*.jade' ]
      , errorMessage = '.stylperjaderc not found'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if options.stylperjaderc is invalid', function (done) {
    var args = [ '-v', '-c', fixturesPath + 'invalid.txt', '**/test*.styl', '**/test*.jade' ]
      , errorMessage = '.stylperjaderc is invalid JSON'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should load config from options.stylperjaderc', function (done) {
    var args = [ '-v', '-c', fixturesPath + '.stylperjaderc', '**/test*.styl', '**/test*.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(chalk.stripColor(stdout).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , stdout)
      done()
    })
  })

  it('should load config from .stylperjaderc in project root if no options are set', function (done) {
    var args = [ '**/test*.styl', '**/test*.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 2, code)
      assert.equal(stdout, '', stdout)
      assert.equal(chalk.stripColor(stderr).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , stderr)
      done()
    })
  })

  it('should load config from the .stylperjaderc in working directory when set in options', function (done) {
    var args = [ '-v', '-C', fixturesPath, 'test*.styl', 'test*.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(chalk.stripColor(stdout).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , stdout)
      done()
    })
  })

  it('should use empty config if working directory does not contain .stylperjaderc', function (done) {
    var args = [ '-C', __dirname, '**/test*.styl', '**/test*.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-unused.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 2, code)
      assert.equal(stdout, '', stdout)
      assert.equal(chalk.stripColor(stderr).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , stderr)
      done()
    })
  })

  it('should report the locations of unused Stylus classes from all files', function (done) {
    var args = [ '-v', '-c', fixturesPath + '.stylperjaderc', '**/test*.styl', '**/test*.jade' ]
      , expectedReport = fs.readFileSync(fixturesPath + 'expected-none.txt', 'utf-8')

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(chalk.stripColor(stdout).trim()
        , expectedReport.replace(/%dirname%/g, __dirname).trim()
        , stdout)
      done()
    })
  })

  it('should output silently by default', function (done) {
    var args = [ '-c', fixturesPath + '.stylperjaderc', '**/test*.styl', '**/test*.jade' ]

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr, '', stderr)
      done()
    })
  })

})
