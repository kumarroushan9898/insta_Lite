
const prisma = require("../database/db");

async function createPost(postData) {
  return await prisma.post.create({
    data: {
      imageUrl: postData.imageUrl,
      caption: postData.caption,
      location: postData.location,
      authorId: Number(postData.authorId),
    },
  });
}

async function getAllPosts() {
  return await prisma.post.findMany({
    include: {
      author: true,
    },
  });
}

async function getPostById(id) {
  return await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: true,
    },
  });
}

async function updatePost(id, postData) {
  return await prisma.post.update({
    where: { id: Number(id) },
    data: {
      caption: postData.caption,
      location: postData.location,
    },
  });
}

async function deletePost(id) {
  return await prisma.post.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
