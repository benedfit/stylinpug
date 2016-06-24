var assert = require('assert')
  , chalk = require('chalk')
  , fs = require('fs')
  , packageDetails = require('../package.json')
  , spawn = require('child_process').spawn
  , utils = require('../lib/utils')

  , bin = require.resolve('.' + packageDetails.bin[packageDetails.name])
  , fixturesPath = __dirname + '/fixtures/'
  , helpMessage = 'Usage: ' + packageDetails.name + ' [options] <paths ...>'

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

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(helpMessage) !== -1, true, stdout)
      assert.equal(stdout.indexOf(packageDetails.description) !== -1, true, stdout)
      done()
    })
  })

  it('should output help if no arguments specified', function (done) {
    var args = []

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stderr, '', stderr)
      assert.equal(stdout.indexOf(helpMessage) !== -1, true, stdout)
      assert.equal(stdout.indexOf(packageDetails.description) !== -1, true, stdout)
      done()
    })
  })

  it('should error if no Stylus files found', function (done) {
    var args = [ 'nonexistent', '**/test*.pug' ]
      , errorMessage = 'No Stylus files found'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if no Pug files found', function (done) {
    var args = [ '**/test*.styl', 'nonexistent' ]
      , errorMessage = 'No Pug files found'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if Stylus files are invalid', function (done) {
    var stylusFile = 'invalid.styl'
      , args = [ '**/' + stylusFile, '**/test*.pug' ]
      , errorMessage = 'Stylus file \'' + fixturesPath + stylusFile + '\' error - '

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if Pug files are invalid', function (done) {
    var pugFile = 'invalid.pug'
      , args = [ '**/test*.styl', '**/' + pugFile ]
      , errorMessage = 'Pug file \'' + fixturesPath + pugFile + '\' error - '

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if options.config is not found', function (done) {
    var args = [ '-c', 'nonexistent', '**/test*.styl', '**/test*.pug' ]
      , errorMessage = utils.configPath + ' not found'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should error if options.config is invalid', function (done) {
    var args = [ '-v', '-c', fixturesPath + 'invalid.json', '**/test*.styl', '**/test*.pug' ]
      , errorMessage = utils.configPath + ' is invalid JSON'

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 1, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr.indexOf(errorMessage) !== -1, true, stderr)
      done()
    })
  })

  it('should load config from options.config', function (done) {
    var args = [ '-v', '-c', fixturesPath + utils.configPath, '**/test*.styl', '**/test*.pug' ]
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

  it('should load config from config file in project root if no options are set', function (done) {
    var args = [ '**/test*.styl', '**/test*.pug' ]
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

  it('should load config from the config file in working directory when set in options', function (done) {
    var args = [ '-v', '-C', fixturesPath, 'test*.styl', 'test*.pug' ]
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

  it('should use empty config if working directory does not contain config file', function (done) {
    var args = [ '-C', __dirname, '**/test*.styl', '**/test*.pug' ]
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
    var args = [ '-v', '-c', fixturesPath + utils.configPath, '**/test*.styl', '**/test*.pug' ]
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
    var args = [ '-c', fixturesPath + utils.configPath, '**/test*.styl', '**/test*.pug' ]

    run(args, function (err, code, stdout, stderr) {
      assert(!err, err)
      assert.equal(code, 0, code)
      assert.equal(stdout, '', stdout)
      assert.equal(stderr, '', stderr)
      done()
    })
  })

})
