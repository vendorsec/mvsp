const fs = require('fs')
const path = require('path')
const glob = require('glob')

module.exports = function () {
  const docPath = path.dirname(require.resolve('@mvsp/doc/package.json'))
  const versions = [];
  glob.sync(path.join(docPath, '*.asciidoc')).forEach(function(file) {
    const name = path.basename(file)
    const version = name.split(/mvsp-(.*)\...\.asciidoc/)[1] ?? "head"
    const content = fs.readFileSync(file)
    versions.push({content, version})
  })
  return versions;
}
