var fs = require('fs')
  , path = require('path')
  , stylus = require('stylus')

  , fixturesPath = __dirname + '/fixtures/'
  , stylusFixtures = []

before(function (done) {
  var filename = fixturesPath + 'test.styl'
    , input = fs.readFileSync(filename, 'utf8')
    , style = stylus(input).set('filename', filename)

  renderStylus(style, fixturesPath + 'test.css')

  style = style.set('sourcemap', { inline: false, basePath: fixturesPath, sourceRoot: fixturesPath })

  renderStylus(style, fixturesPath + 'test-sourcemap.css')

  style = style.set('sourcemap', { inline: true })

  renderStylus(style, fixturesPath + 'test-sourcemap-inline.css')

  function renderStylus(style, file) {

    style.render(function (err, output) {
      if (err) done(err)

      fs.writeFileSync(file, output)

      stylusFixtures.push(file)

      if (style.options.sourcemap && !style.options.sourcemap.inline) {
        file = style.options.filename.replace(path.extname(style.options.filename), '.css.map')

        fs.writeFileSync(file, JSON.stringify(style.sourcemap))

        stylusFixtures.push(file)
      }
    })

  }

  done()
})

after(function (done) {
  stylusFixtures.forEach(function (file) {
    fs.unlinkSync(file)
  })

  done()
})
