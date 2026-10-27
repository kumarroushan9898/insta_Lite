const prisma = require("../database/db");
const likesService = require("../services/likes.service");

async function getLikesByPostId(req, res) {
  try {
    const users = await likesService.getLikesByPostId(req.params.id);

    if (users === null) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function likePost(req, res) {
  const { userId } = req.body;
  const postId = req.params.id;

  // 1. Check userId provided
  if (userId === undefined || userId === null) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    // 2. Check post exists
    const post = await prisma.post.findUnique({
      where: { id: Number(postId) },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // 3. Check user exists
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Create like, catch duplicate (P2002)
    const like = await likesService.likePost(userId, postId);
    return res.status(201).json({
      userId: like.userId,
      postId: like.postId,
      createdAt: like.createdAt,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function unlikePost(req, res) {
  const { id: postId, userId } = req.params;

  try {
    await likesService.unlikePost(userId, postId);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getLikesByPostId,
  likePost,
  unlikePost,
};
