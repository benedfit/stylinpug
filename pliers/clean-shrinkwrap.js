/* istanbul ignore next */
module.exports = task

function task(pliers) {
  pliers('cleanShrinkwrap', require('pliers-clean-shrinkwrap')(pliers))
}
