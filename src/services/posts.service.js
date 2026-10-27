const prisma = require("../database/db");
const { buildMeta } = require("../utils/pagination");

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

  // Sort by likes count with tie-breaker createdAt desc, or standard field sort
  let orderBy;
  if (sortBy === "likes") {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = {
      [sortBy]: order,
    };
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: buildMeta(page, limit, total),
  };
}

async function getPostById(id) {
  return await prisma.post.findUnique({
    where: { id: Number(id) },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
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
