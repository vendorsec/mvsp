const fs = require('fs')
const path = require('path')
const glob = require('glob')

const wipWarn = 'This is a work in progress version of the controls, not suitable for production use. Expect frequent changes.'

module.exports = function () {
  const docPath = path.dirname(require.resolve('@mvsp/doc/package.json'))
  const versions = [];
  glob.sync(path.join(docPath, '*.asciidoc')).forEach(function(file) {
    const name = path.basename(file)
    const version = name.split(/mvsp-(.*)\...\.asciidoc/)[1] ?? "head"
    const content = fs.readFileSync(file)
    const warn = version == 'alpha' ? wipWarn : '';
    versions.push({content, version, warn})
  })
  return versions;
}
