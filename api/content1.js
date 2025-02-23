const express = require("express");
const contentRoutes = require("../routes/contentRoutes");

const app = express();
app.use(express.json());
app.use(contentRoutes);

module.exports = (req, res) => {
    app(req, res);
}