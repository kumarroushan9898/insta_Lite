const prisma = require("../database/db");

async function getLikesByPostId(postId) {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: Number(postId) },
  });

  if (!post) {
    return null;
  }

  // Find users who liked this post, sorted by username ascending
  return await prisma.user.findMany({
    where: {
      likes: {
        some: {
          postId: Number(postId),
        },
      },
    },
    select: {
      id: true,
      username: true,
      fullname: true,
    },
    orderBy: {
      username: "asc",
    },
  });
}

async function likePost(userId, postId) {
  return await prisma.like.create({
    data: {
      userId: Number(userId),
      postId: Number(postId),
    },
  });
}

async function unlikePost(userId, postId) {
  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId: Number(userId),
        postId: Number(postId),
      },
    },
  });
}

module.exports = {
  getLikesByPostId,
  likePost,
  unlikePost,
};
