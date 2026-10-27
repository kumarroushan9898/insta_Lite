const prisma = require("../database/db.js");
const { buildMeta } = require("../utils/pagination");

async function createUser(userData) {
  return await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      fullname: userData.fullname,
      bio: userData.bio,
    },
  });
}

async function getAllUsers(
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  filters = {}
) {
  const skip = (page - 1) * limit;
  const where = {};

  if (filters.isPrivate !== undefined) {
    where.isPrivate = filters.isPrivate;
  }

  if (filters.hasPosts === true) {
    where.posts = { some: {} };
  } else if (filters.hasPosts === false) {
    where.posts = { none: {} };
  }

  if (filters.search) {
    where.OR = [
      {
        username: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
      {
        fullname: {
          contains: filters.search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: buildMeta(page, limit, total),
  };
}

async function getUserById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
}

async function updateUser(id, userData) {
  return await prisma.user.update({
    where: { id: Number(id) },
    data: {
      fullname: userData.fullname,
      bio: userData.bio,
      isPrivate: userData.isPrivate,
    },
  });
}

async function deleteUser(id) {
  return await prisma.user.delete({
    where: { id: Number(id) },
  });
}

async function getUserPosts(userId, page = 1, limit = 10) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    return null;
  }

  const skip = (page - 1) * limit;
  const where = { authorId: Number(userId) };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: buildMeta(page, limit, total),
  };
}

async function getLikedPosts(userId, page = 1, limit = 10) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user) {
    return null;
  }

  const skip = (page - 1) * limit;
  const where = {
    likes: {
      some: {
        userId: Number(userId),
      },
    },
  };

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
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: buildMeta(page, limit, total),
  };
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getLikedPosts,
};
