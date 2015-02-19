var fs = require('fs')
  , walk = require('jade-walk')
  , parse = require('jade-parser')
  , lex = require('jade-lexer')

module.exports = function (stylusFiles, jadeFiles) {

  return function (done) {

    var classNames = []
      , file = jadeFiles[0]

    fs.readFile(file, 'utf8', function (err, data) {
      if (err) {
        done(err)
      } else {
        walk(parse(lex(data)), function after(node) {
          if (node.type === 'Tag') {
            node.attrs.forEach(function (attr) {
              if (attr.name === 'class' && classNames.indexOf(attr.val) === -1) {
                classNames.push(attr.val)
              }
            })
          }
        })

        classNames.forEach(function (className, index) {
          console.log(index, className)
        })

        done()
      }
    })

  }

}
