const fs = require('fs')
const path = require('path')
const glob = require('glob')

const wipWarn = 'This is a work in progress version of the controls, not suitable for production use. Expect frequent changes.'

module.exports = function () {
  const docPath = path.dirname(require.resolve('@mvsp/doc/package.json'))
  const versions = [];
  const headingPattern = /^\| ([0-9]+)\.([0-9]+).*$/gm
  glob.sync(path.join(docPath, 'mvsp*.asciidoc')).forEach(function(file) {
    const name = path.basename(file)
    const version = name.split(/mvsp-(.*)\...\.asciidoc/)[1] ?? "head"
    const versionPath = version == "head" ? "" : version + "/"

    // | 1.1 Vulnerability reports ^link:/faq-mvsp.en/{version}/index.html#FAQ_1_1[FAQ]^
    let content = fs.readFileSync(file).toString('utf8').replace(
      headingPattern,
      function (match, g1, g2) {
        return `${match} ^link:/faq-mvsp.en/${versionPath}index.html#FAQ_${g1}_${g2}[FAQ]^`
      }
    )

    // | 1.1 Vulnerability reports
    // anchor:FAQ_1_1[]
    const faqPath = path.join(docPath, name.replace('mvsp', 'faq-mvsp'))
    const faq = fs.readFileSync(faqPath).toString('utf8').replace(
      headingPattern,
      function (match, g1, g2) { return match + `\nanchor:FAQ_${g1}_${g2}[]`
    })
    const warn = version == 'alpha' ? wipWarn : '';
    versions.push({content, faq, version, warn})
  })
  return versions;
}
