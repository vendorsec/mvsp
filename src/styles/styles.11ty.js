const postcss = require('postcss')
const fs = require('fs')
const path = require('path')
const code = fs.readFileSync(path.join(__dirname, 'styles.pcss'), 'utf-8')

class Tailwind {
  async render() {
    return await postcss([
      require('postcss-import'),
      require('tailwindcss'),
      require('postcss-nested'),
      require('autoprefixer'),
    ])
      .process(code, { from: undefined })
      .then((result) => result.css)
  }
  data() {
    return {
      templateEngineOverride: '11ty.js',
      permalink: '/styles.css',
    }
  }
}

module.exports = Tailwind
