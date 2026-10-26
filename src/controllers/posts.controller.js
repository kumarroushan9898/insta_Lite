
const postsService = require("../services/posts.service");

async function createPost(req, res) {
  try {
    const { imageUrl, caption, location, authorId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    if (!authorId || !Number.isInteger(Number(authorId))) {
      return res.status(400).json({ error: "valid authorId is required" });
    }

    const post = await postsService.createPost({
      imageUrl,
      caption,
      location,
      authorId,
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllPosts(req, res) {
  try {
    const posts = await postsService.getAllPosts();
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getPostById(req, res) {
  try {
    const post = await postsService.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updatePost(req, res) {
  try {
    const post = await postsService.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const data = {};
    const { caption, location } = req.body;

    if (caption !== undefined) data.caption = caption;
    if (location !== undefined) data.location = location;

    const updatedPost = await postsService.updatePost(req.params.id, data);

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deletePost(req, res) {
  try {
    const post = await postsService.getPostById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await postsService.deletePost(req.params.id);

    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
