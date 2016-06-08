var stylperjade = require('../lib/stylperjade')
  , packageDetails = require('../package.json')
  , program = require('commander')

function run (args) {

  program
    .version(packageDetails.version)
    .description(packageDetails.description)
    .usage('[options] <stylusFiles ...> <jadeFiles ...>')
    .option('-v, --verbose'
      , 'displays the full visual representation of blacklisted and unused classes')
    .option('-C, --chdir <path>'
      , 'change the working directory')
    .option('-c, --config <path>'
      , 'set path to load options from. Defaults to ./.stylperjaderc')
    .parse(args)

  var stylusFiles = []
    , jadeFiles = []
    , options = {}

  parseOptions()
  parseArgs(program.args)

  if (!stylusFiles.length || !jadeFiles.length) {
    program.help()
  }

  stylperjade(stylusFiles, jadeFiles, options, function (err, results) {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    if (results.blacklistedTotal > 0 || results.unusedTotal > 0) {
      console.error(results.report)
      process.exit(2)
    } else if (results.report.trim().length) {
      console.log(results.report)
      process.exit(0)
    }
  })

  function parseArgs (args) {

    if (args.length === 1 && args[0] === '.') {
      stylusFiles = [ '**/*.styl' ]
      jadeFiles = [ '**/*.jade' ]
    } else {
      stylusFiles = args[0] && typeof args[0] === 'string' ? [ args[0] ] : []
      jadeFiles = args[1] && typeof args[1] === 'string' ? [ args[1] ] : []
    }

  }

  function parseOptions () {
    if (program.chdir) {
      options.cwd = program.chdir
    }

    if (program.config) {
      options.stylperjaderc = program.config
    }

    if (program.verbose) {
      options.verbose = program.verbose
    }
  }

}

module.exports = run
