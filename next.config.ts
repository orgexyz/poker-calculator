const isGithubPages = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export', // Important for GitHub Pages
  assetPrefix: isGithubPages ? '/poker-calculator/' : '',
  basePath: isGithubPages ? '/poker-calculator' : '',
  trailingSlash: true, // Optional, often improves routing compatibility
}

module.exports = nextConfig
