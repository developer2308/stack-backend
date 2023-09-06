const express = require("express");
const router = express.Router();
const sites = require("../services/sites");

router.get("/", async function (req, res, next) {
  try {
    res.json(await sites.getAll());
  } catch (err) {
    console.error(`Error while getting sites `, err.message);
    next(err);
  }
});

module.exports = router;
