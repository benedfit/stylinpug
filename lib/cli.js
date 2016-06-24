var reporter = require('../lib/reporter')
  , packageDetails = require('../package.json')
  , program = require('commander')
  , utils = require('../lib/utils')

function run (args) {

  program
    .version(packageDetails.version)
    .description(packageDetails.description)
    .usage('[options] <paths ...>')
    .option('-v, --verbose'
      , 'displays the full visual representation of blacklisted and unused classes')
    .option('-C, --chdir <path>'
      , 'change the working directory')
    .option('-c, --config <path>'
      , 'set path to load options from. Defaults to ./' + utils.configPath)
    .parse(args)

  var options = parseOptions()

  if (!program.args.length) {
    program.help()
  }

  reporter(program.args, options, function (err, results) {
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

  function parseOptions () {
    var options = {}

    if (program.chdir) {
      options.cwd = program.chdir
    }

    if (program.config) {
      options.config = program.config
    }

    if (program.verbose) {
      options.verbose = program.verbose
    }

    return options
  }

}

module.exports = run
