const isGithubPages = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export', // Important for GitHub Pages
  assetPrefix: isGithubPages ? '/REPO_NAME/' : '',
  basePath: isGithubPages ? '/REPO_NAME' : '',
  trailingSlash: true, // Optional, often improves routing compatibility
}

module.exports = nextConfig
