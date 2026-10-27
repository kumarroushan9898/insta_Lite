
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


async function getAllPosts(
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  filters = {}
) {
  const skip = (page - 1) * limit;

  const where = {};

  if (filters.location) {
    where.location = {
      equals: filters.location,
      mode: "insensitive",
    };
  }

  if (filters.search) {
    where.caption = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  if (filters.from || filters.to) {
    where.createdAt = {};

    if (filters.from) {
      where.createdAt.gte = new Date(filters.from);
    }

    if (filters.to) {
      where.createdAt.lt = new Date(filters.to);
    }
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: {
        author: true,
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
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
