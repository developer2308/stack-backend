require("dotenv").config();

const express = require("express");
const path = require("path");
var cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const postsRouter = require("./routes/posts");
app.use(express.json());
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.send("Hello world!");
});
app.use("/posts", postsRouter);
/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
