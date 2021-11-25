const fs = require('fs')
const asciidoctor = require('asciidoctor')()

class Mvsp {
  render() {
    const content = fs.readFileSync(
      require.resolve('@mvsp/doc/mvsp.en.asciidoc')
    )
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
