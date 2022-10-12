const asciidoctor = require('asciidoctor')()

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./tailwind.config.js')
  eleventyConfig.addWatchTarget('./src/**/*.*')
  eleventyConfig.addPassthroughCopy('./src/robots.txt')
  eleventyConfig.addPassthroughCopy('./src/fonts/')
  eleventyConfig.addPassthroughCopy('./src/images/')
  eleventyConfig.addPassthroughCopy('./src/styles/')
  eleventyConfig.addShortcode("asciidoc", function(value) {
    return `${asciidoctor.convert(value)}`
  });
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
