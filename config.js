require('dotenv').config()

const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectTimeout: process.env.DB_TIMEOUT,
  },
  defaultSiteID: process.env.DEFAULT_SITE_ID,
};
module.exports = config;
