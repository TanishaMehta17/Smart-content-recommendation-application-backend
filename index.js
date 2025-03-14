const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const serverless= require("serverless-http");
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const queryRoutes = require('./routes/queryRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const fileRoutes= require("./routes/fileRoutes");

dotenv.config();

// Initialize Prisma Client
const prisma = require('./config/db')

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/query", queryRoutes);
app.use("/api/recommendation", recommendationRoutes);
app.use("/file",fileRoutes);
//app.get("/", async(req, res) => {res.json({msg: " server online"})});


app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
// module.exports.handler = serverless(app);