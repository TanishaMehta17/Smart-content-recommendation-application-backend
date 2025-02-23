const express = require("express");
const queryRoutes = require('../routes/queryRoutes');

const app = express();
app.use(express.json());
app.use(queryRoutes);

module.exports = (req, res) => {
  app(req, res);
};
