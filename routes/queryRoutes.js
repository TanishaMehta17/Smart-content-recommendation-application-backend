const express = require("express");
const {
 saveQuery,
  
} = require("../controllers/queryController");

const queryRouter = express.Router();

queryRouter.post("/save-query", saveQuery);
module.exports = queryRouter;
