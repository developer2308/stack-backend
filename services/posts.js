const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function get(req) {
  const id = req.params.id;
  const siteId = req.query.site || config.defaultSiteID;
  const rows = await db.query(
    `SELECT * from posts where id=${id} and siteid=${siteId} limit 1`
  );
  if (rows) {
    return rows[0];
  } else {
    console.error(`undefined post id `);
    return false;
  }
}

async function search(req) {
  const {
    q,
    tab = "relevance",
    page = 1,
    pagesize = 10,
    site = config.defaultSiteID,
  } = req.query;

  const offset = helper.getOffset(page, pagesize);
  const orderBy = {
    votes: ``,
    relevance: ``,
    newest: ``,
    active: ``,
  };
  let where = `where siteid=${site} `;
  if (q) {
    where += `and title like '%${q}%'`;
  }

  const limit = `LIMIT ${offset},${pagesize}`;

  const rows = await db.query(
    `SELECT * from posts  ${where} ${orderBy[tab]} ${limit}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

module.exports = {
  get,
  search,
};
