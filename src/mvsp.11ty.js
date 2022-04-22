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
      title: 'Minimum Viable Secure Product - Controls',
      description: 'Minimum Viable Secure Product is a minimalistic security checklist for B2B software and business process outsourcing suppliers.',
      layout: 'article',
      permalink: '/mvsp.en/',
    }
  }
}

module.exports = Mvsp
