const team = require('./src/config/team.config.json');

module.exports = {
  siteUrl: team.siteUrl,
  generateRobotsTxt: true,
  sitemapSize: 7000,
  autoLastmod: false,
  generateIndexSitemap: false,
  outDir: './out',
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      }
    ]
  }
};
