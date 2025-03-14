const express = require("express");
const {
    testGenerativeAI,
    fetchYouTubeVideos,
    fetchUnsplashImages,
    fetchAllContent
  
} = require("../controllers/contentController");

const contentRouter = express.Router();

contentRouter.post("/videos", fetchYouTubeVideos);
contentRouter.post("/images", fetchUnsplashImages);
contentRouter.post("/all", fetchAllContent);
contentRouter.post("/articles", testGenerativeAI);
module.exports = contentRouter;
