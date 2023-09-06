const db = require("./db");
const helper = require("../helper");

async function getAll() {
  const params = [];
  const query = "select * from sites order by TotalQuestions desc";
  const rows = await db.query(query, params);
  const data = helper.emptyOrRows(rows);
  return data;
}

module.exports = {
  getAll,
};
