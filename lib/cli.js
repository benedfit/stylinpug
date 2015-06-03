var stylperjade = require('../lib/stylperjade')
  , package = require('../package.json')
  , updateNotifier = require('update-notifier')

function run(program) {

  updateNotifier({ pkg: package }).notify()

  var cssFiles = []
    , jadeFiles = []
    , options = {}

  parseArgs(program.args)

  if (!cssFiles.length || !jadeFiles.length) {
    program.help()
  }

  if (program.config) {
    options.stylperjaderc = program.config
  }

  try {
    stylperjade(cssFiles, jadeFiles, options, function (err, results) {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      if (results.blacklistedTotal > 0 || results.unusedTotal > 0) {
        console.error(results.report)
      } else if (program.verbose) {
        console.log(results.report)
      }

      process.exit()
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

  function parseArgs(args) {

    if (args.length === 1 && args[0] === '.') {
      cssFiles = [ '**/*.css' ]
      jadeFiles = [ '**/*.jade' ]
    } else {
      cssFiles = args[0] && typeof args[0] === 'string' ? [ args[0] ] : []
      jadeFiles = args[1] && typeof args[1] === 'string' ? [ args[1] ] : []
    }

  }

}

module.exports = run
