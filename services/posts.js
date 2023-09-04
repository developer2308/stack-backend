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
    tab = "newest",
    page = 1,
    pagesize = 15,
    site = config.defaultSiteID,
  } = req.query;

  const offset = helper.getOffset(page, pagesize);
  const orderBy = {
    score: `order by a.score desc`,
    relevance: `order by a.score desc`,
    newest: `order by a.creationdate desc`,
    active: `order by a.lastactivitydate desc`,
  };
  let where = `where a.siteid=${site} and a.title is not null and a.deletiondate is null `;
  if (q) {
    where += `and (a.title like '%${q}%' or a.body like '%${q}%')`;
  }

  const limit = `LIMIT ${offset},${pagesize}`;

  const voteCountTable = `select sum(case when votetypeid=2 then 1 when votetypeid=3 then -1 else 0 end) VoteCount, PostId from votes where siteid=${site} group by postid`;
  const query = `SELECT a.*, b.Reputation, b.DisplayName, c.VoteCount from posts a left join users b on a.OwnerUserId=b.id and b.siteid=${site} left join (${voteCountTable}) c on a.id=c.postid ${where} ${orderBy[tab]} ${limit}`;
  const rows = await db.query(query);
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
