const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function getMultiple(page = 1) {
  const offset = helper.getOffset(page, config.listPerPage);
  const rows = await db.query(
    `SELECT * from posts LIMIT ${offset},${config.listPerPage}`
  );
  const data = helper.emptyOrRows(rows);
  const meta = { page };

  return {
    data,
    meta,
  };
}

async function search(req) {
  const { q, tab = "relevance", page = 1, pagesize = 10, site = 1 } = req.query;

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
  getMultiple,
  search,
};
