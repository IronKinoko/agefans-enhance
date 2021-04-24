const JSDOM = require('jsdom').JSDOM
const fs = require('fs')
const path = require('path')
const minify = require('html-minifier-terser').minify
const dom = new JSDOM(
  fs.readFileSync(path.resolve(__dirname, '../website/index.html'), 'utf-8')
).window.document

Array.from(dom.scripts).forEach((o) => {
  if (o.src === 'index.js') {
    o.removeAttribute('src')
    o.innerHTML = fs.readFileSync(
      path.resolve(__dirname, '../website/index.js'),
      'utf-8'
    )
  }
})

if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
  fs.mkdirSync(path.resolve(__dirname, '../dist'))
}
fs.writeFileSync(
  path.resolve(__dirname, '../dist/index.html'),
  minify(dom.documentElement.outerHTML, {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
  })
)
