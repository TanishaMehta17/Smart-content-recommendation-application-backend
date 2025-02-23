const express = require("express");
const authRoutes = require("../routes/authRoutes");

const app = express();
app.use(express.json());
app.use(authRoutes);

module.exports = (req, res) => {
  app(req, res);
};
