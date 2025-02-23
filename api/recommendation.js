const express = require("express");
const recommendationRoutes = require("../routes/recommendationRoutes");

const app = express();
app.use(express.json());
app.use(recommendationRoutes);

module.exports = (req, res) => {
    app(req, res);
};
