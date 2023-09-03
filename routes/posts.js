const express = require("express");
const router = express.Router();
const posts = require("../services/posts");

router.get("/", async function (req, res, next) {
  try {
    res.json(await posts.getMultiple(req.query.page));
  } catch (err) {
    console.error(`Error while getting posts `, err.message);
    next(err);
  }
});

router.get("/search", async function (req, res, next) {
  try {
    res.json(await posts.search(req));
  } catch (err) {
    console.error(`Error while searching programming languages `, err.message);
    next(err);
  }
});

router.get("/:id", async function (req, res, next) {
    try {
      res.json(await posts.search(req));
    } catch (err) {
      console.error(`Error while searching programming languages `, err.message);
      next(err);
    }
  });

  
module.exports = router;
