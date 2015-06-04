module.exports = tasks

var glob = require('glob')

function tasks(pliers) {

  // Load pliers plugins
  glob.sync(__dirname + '/pliers/*.js').forEach(function (file) {
    require(file)(pliers)
  })

}
