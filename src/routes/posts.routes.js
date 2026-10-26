
const express = require("express");
const router = express.Router();

const postsController = require("../controllers/posts.controller");

router.post("/", postsController.createPost);
router.get("/", postsController.getAllPosts);
router.get("/:id", postsController.getPostById);
router.patch("/:id", postsController.updatePost);
router.delete("/:id", postsController.deletePost);

module.exports = router;
