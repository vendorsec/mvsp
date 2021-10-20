const fs = require('fs')
const asciidoctor = require('asciidoctor')()

class Mvsp {
  render() {
    const content = fs.readFileSync('./src/mvsp.en.asciidoc')
    return asciidoctor.convert(content)
  }
  data() {
    return {
      title: 'Minimum Viable Secure Product',
      layout: 'article',
      permalink: '/mvsp.en/',
    }
  }
}

module.exports = Mvsp
