const fs = require('fs')
const path = require('path')
const glob = require('glob')

const wipWarn = 'This is a work in progress version of the controls, not suitable for production use. Expect frequent changes.'

module.exports = function () {
  const docPath = path.dirname(require.resolve('@mvsp/doc/package.json'))
  const versions = [];
  glob.sync(path.join(docPath, 'mvsp*.asciidoc')).forEach(function(file) {
    const name = path.basename(file)
    const version = name.split(/mvsp-(.*)\...\.asciidoc/)[1] ?? "head"
    const content = fs.readFileSync(file, 'utf8')
    const content_versioned = content.toString('utf8').replace('{docname}', 'mvsp-' + version)
    const faq = fs.readFileSync(path.join(docPath, name.replace('mvsp', 'faq-mvsp')))
    const warn = version == 'alpha' ? wipWarn : '';
    versions.push({content_versioned, content, faq, version, warn})
  })
  return versions;
}
