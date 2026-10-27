
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
  const page = Number(req.query.page ?? 1);
  const requestedLimit = Number(req.query.limit ?? 10);

  if (
    !Number.isInteger(page) ||
    page <= 0 ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit <= 0
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  const limit = Math.min(requestedLimit, 50);
  const sortBy = req.query.sortBy ?? "createdAt";
  const order = req.query.order ?? "desc";

  if (!["createdAt", "updatedAt"].includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt",
    });
  }

  if (!["asc", "desc"].includes(order)) {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  const { location, search, from, to } = req.query;

  const isValidDate = (value) =>
    typeof value === "string" &&
    value.trim() !== "" &&
    !Number.isNaN(Date.parse(value));

  if (
    (from !== undefined && !isValidDate(from)) ||
    (to !== undefined && !isValidDate(to))
  ) {
    return res.status(400).json({
      error: "from and to must be valid dates",
    });
  }

  try {
    const result = await postsService.getAllPosts(
      page,
      limit,
      sortBy,
      order,
      { location, search, from, to }
    );

    return res.status(200).json(result);
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

    const updatedPost = await postsService.updatePost(
      req.params.id,
      data
    );

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
