const express = require("express");
const {
  fetchYouTubeVideos,
  fetchUnsplashImages,
  testGenerativeAI,
  fetchAllContent
  
} = require("../controllers/contentController");

const contentRouter = express.Router();

contentRouter.post("/videos", fetchYouTubeVideos);
contentRouter.post("/images", fetchUnsplashImages);
contentRouter.post("/articles", testGenerativeAI);
contentRouter.post("/search", fetchAllContent);
module.exports = contentRouter;
