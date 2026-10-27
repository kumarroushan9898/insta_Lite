const prisma = require("../database/db");
const postsService = require("../services/posts.service");
const { parsePagination } = require("../utils/pagination");

async function createPost(req, res) {
  try {
    const { imageUrl, caption, location, authorId } = req.body;

    if (!imageUrl || !authorId) {
      return res.status(400).json({
        error: "imageUrl and authorId are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(authorId) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await postsService.createPost({
      imageUrl,
      caption,
      location,
      authorId,
    });

    return res.status(201).json(post);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllPosts(req, res) {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit } = pagination;
  const sortBy = req.query.sortBy ?? "createdAt";
  const order = req.query.order ?? "desc";

  const allowedSortFields = ["createdAt", "updatedAt", "likes"];
  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt, likes",
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

    // authorId is not editable - silently ignored if sent
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
