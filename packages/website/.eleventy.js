const asciidoctor = require('asciidoctor')()
const eleventyParcelPlugin = require('@kitschpatrol/eleventy-plugin-parcel')

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyParcelPlugin)
  eleventyConfig.addWatchTarget('./tailwind.config.js')
  eleventyConfig.addWatchTarget('./src/**/*.*')
  eleventyConfig.addPassthroughCopy('./src/robots.txt')
  eleventyConfig.addPassthroughCopy('./src/fonts/')
  eleventyConfig.addPassthroughCopy('./src/images/')
  eleventyConfig.addPassthroughCopy('./src/images/contributors/')
  eleventyConfig.addPassthroughCopy('./src/styles/')
  eleventyConfig.addPassthroughCopy('./src/js/')
  eleventyConfig.addShortcode('asciidoc', function (value, docname) {
    return `${asciidoctor.convert(
      value, { 'attributes': { 'custom': docname } } )
    }`
  })
  return {
    templateFormats: ['html', 'njk', '11ty.js', 'md'],
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: '_site',
      layouts: '_layouts',
      includes: '_includes',
      data: '_data',
    },
  }
}
