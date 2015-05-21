var stylperjade = require('../lib/stylperjade')

function run (program) {

  var cssFiles = parseArgs(program.args, 0)
    , jadeFiles = parseArgs(program.args, 1)
    , options = {}

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

      if (program.verbose) {
        console.log(results.report)
      }

      process.exit()
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }

  function parseArgs(args, index) {

    return args && args[index] && typeof args[index] === 'string' ? [ args[index] ] : []

  }

}

module.exports = run
