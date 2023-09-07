const db = require("./db");
const helper = require("../helper");
const config = require("../config");

async function get(req) {
  const id = req.params.id;
  const siteId = req.query.site || config.defaultSiteID;
  const rows = await db.query(
    "SELECT * from posts where id=? and siteid=? limit 1",
    [id, siteId]
  );
  if (rows && rows.length) {
    const post = rows[0];
    const ownerQuery = `SELECT DisplayName, Reputation from users a where a.id=${post["OwnerUserId"]} and siteid=${siteId}`;
    const ownerRows = await db.query(ownerQuery);
    if (ownerRows && ownerRows.length) {
      const owner = ownerRows[0];
      const badgeQuery = `SELECT Class, count(*) BadgeCount from badges a where a.userid=${post["OwnerUserId"]} and siteid=${siteId} group by class`;
      const badgeRows = await db.query(badgeQuery);
      if (badgeRows) {
        const badges = {};
        badgeRows.forEach((badge) => {
          badges[badge["Class"]] = badge["BadgeCount"];
        });
        owner["Badges"] = badges;
      }
      post["owner"] = owner;
    }

    const editorQuery = `SELECT DisplayName, Reputation from users a where a.id=${post["LastEditorUserId"]} and siteid=${siteId}`;
    const editorRows = await db.query(editorQuery);
    if (editorRows && editorRows.length) {
      const editor = editorRows[0];
      const badgeQuery = `SELECT Class, count(*) BadgeCount from badges a where a.userid=${post["LastEditorUserId"]} and siteid=${siteId} group by class`;
      const badgeRows = await db.query(badgeQuery);
      if (badgeRows) {
        const badges = {};
        badgeRows.forEach((badge) => {
          badges[badge["Class"]] = badge["BadgeCount"];
        });
        editor["Badges"] = badges;
      }
      post["editor"] = editor;
    }

    const answersQuery = `SELECT * from posts where posttypeid=2 and parentid=${id} and siteid=${siteId}`;
    const answersRows = await db.query(answersQuery);
    if (answersRows) {
      for (let i = 0; i < answersRows.length; i++) {
        const answer = answersRows[i];

        const ownerQuery = `SELECT DisplayName, Reputation from users a where a.id=${answer["OwnerUserId"]} and siteid=${siteId}`;
        const ownerRows = await db.query(ownerQuery);
        if (ownerRows && ownerRows.length) {
          const owner = ownerRows[0];
          const badgeQuery = `SELECT Class, count(*) BadgeCount from badges a where a.userid=${answer["OwnerUserId"]} and siteid=${siteId} group by class`;
          const badgeRows = await db.query(badgeQuery);
          if (badgeRows) {
            const badges = {};
            badgeRows.forEach((badge) => {
              badges[badge["Class"]] = badge["BadgeCount"];
            });
            owner["Badges"] = badges;
          }
          answer["owner"] = owner;
        }

        const commentsQuery = `SELECT a.*, ifnull(a.UserDisplayName, b.DisplayName) DisplayName from comments a left join users b on a.userid=b.id and b.siteid=${siteId} where a.postid=${answer["Id"]} and a.siteid=${siteId}`;
        const commentsRows = await db.query(commentsQuery);
        if (commentsRows) {
          answer["comments"] = commentsRows;
        }
      }
      post["answers"] = answersRows;
    }

    const linkedQuery = `select Id, Title, Score from posts where Id in (SELECT RelatedPostId from postlinks where linktypeid=1 and postid=${id} and siteid=${siteId}) and siteid=${siteId} and posttypeid=1`;
    const linkedRows = await db.query(linkedQuery);
    const relatedQuery = `select Id, Title, Score from posts where Id in (SELECT PostId from postlinks where linktypeid=1 and RelatedPostId=${id} and siteid=${siteId}) and siteid=${siteId} and posttypeid=1`;
    const relatedRows = await db.query(relatedQuery);

    post["linked"] = [];
    if (linkedRows) {
      post["linked"].push(...linkedRows);
    }

    if (relatedRows) {
      post["linked"].push(...relatedRows);
    }
    return post;
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
    score: `order by a.score desc, a.posttypeid desc, a.creationdate desc`,
    relevance: `order by viewcount desc, creationdate asc`,
    newest: `order by a.creationdate desc`,
    active: `order by a.lastactivitydate desc`,
  };
  const params = [];

  let where = `where a.posttypeid in (1, 2) and a.deletiondate is null and a.siteid=? `;
  params.push(site);

  if (q) {
    const words = helper.splitToWords(q);
    const subWhere = [];
    for (let i = 0; i < words.length; i++) {
      subWhere.push(
        `(a.title like ? or REGEXP_REPLACE(a.body, '<\/?[^>]+(>|$)', '') like ?)`
      );
      params.push(`%${words[i]}%`, `%${words[i]}%`);
    }
    where += `and (${subWhere.join(" and ")}) `;
  }

  const countQuery = `SELECT count(*) total from posts a ${where}`;
  const total = await db.queryCount(countQuery, params);

  const limit = `LIMIT ?,?`;
  params.push(offset, pagesize);

  let query = `SELECT a.* from posts a ${where} ${orderBy[tab]} ${limit}`;
  let queryParams = [...params];

  if (tab === "relevance") {
    query = `SELECT a.* from posts a ${where} ${orderBy[tab]} ${limit}`;
    queryParams = [...params];
  }
  
  const rows = await db.query(query, queryParams);
  const data = helper.emptyOrRows(rows);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    row["Body"] = helper.bodyForList(row["Body"], q);
    const usersQuery = `select * from users where id=${row["OwnerUserId"]} and siteid=${row["SiteId"]} limit 1`;
    const users = await db.query(usersQuery);
    if (users && users.length) {
      row["Reputation"] = users[0]["Reputation"];
      row["DisplayName"] = users[0]["DisplayName"];
    }

    if (row["ParentId"]) {
      const parentQuery = `select * from posts where siteid=${row["SiteId"]} and id=${row["ParentId"]} limit 1`;
      const parents = await db.query(parentQuery);
      if (parents && parents.length) {
        row["parent"] = {
          Id: parents[0]["Id"],
          Title: parents[0]["Title"],
          AcceptedAnswerId: parents[0]["AcceptedAnswerId"],
        };
      }
    }
  }

  const meta = { page, total };

  return {
    data,
    meta,
  };
}

module.exports = {
  get,
  search,
};
