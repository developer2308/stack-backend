const mysql = require("mysql2/promise");
const config = require("../config");

let connection;

async function connect() {
  if (!connection) {
    connection = await mysql.createConnection(config.db);
  }
}

async function query(sql, params) {
  await connect();
  const [results] = await connection.execute(sql, params);

  return results;
}

async function queryCount(sql, params) {
  await connect();
  const [results] = await connection.execute(sql, params);

  return results[0]["total"];
}

module.exports = {
  query,
  queryCount,
};
