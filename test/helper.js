var fs = require('fs')
  , glob = require('glob')
  , path = require('path')
  , stylus = require('stylus')

  , fixturesPath = __dirname + '/fixtures/'
  , stylusFixtures = []

before(function (done) {

  glob('test*.styl', { cwd: fixturesPath }, function (err, files) {
    if (err) done(err)

    files.forEach(function (file) {
      var style = setStylus(fixturesPath + file)
        , baseName = path.basename(file, '.styl')

      renderStylus(style, fixturesPath + baseName + '.css')

      style = style.set('sourcemap', { inline: false, basePath: fixturesPath, sourceRoot: fixturesPath })

      renderStylus(style, fixturesPath + baseName + '-sourcemap.css')

      style = style.set('sourcemap', { inline: true })

      renderStylus(style, fixturesPath + baseName + '-sourcemap-inline.css')
    })

    function renderStylus (style, file) {

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

    function setStylus (filename) {

      var input = fs.readFileSync(filename, 'utf8')

      return stylus(input).set('filename', filename)

    }

    done()
  })

})

after(function (done) {

  stylusFixtures.forEach(function (file) {
    fs.unlinkSync(file)
  })

  done()

})
