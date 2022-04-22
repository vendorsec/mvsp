const fs = require('fs')
const asciidoctor = require('asciidoctor')()

class Faq {
  render() {
    const content = fs.readFileSync('./src/faq.en.asciidoc')
    return `<div class="adoc">
      ${asciidoctor.convert(content)}
    </div>`
  }
  data() {
    return {
      title: 'Minimum Viable Secure Product - Controls FAQ',
      description: 'FAQ: Additional context on the controls listed in the Minimum Viable Secure Product (MVSP).',
      layout: 'page',
      permalink: '/faq.en/',
    }
  }
}

module.exports = Faq
