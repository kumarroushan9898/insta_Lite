
const usersService = require("../services/users.service");

async function createUser(req, res) {
  try {
    const { username, email, fullname, bio } = req.body;

    if (!username || !email || !fullname) {
      return res.status(400).json({
        error: "username, email and fullname are required",
      });
    }

    const user = await usersService.createUser({
      username,
      email,
      fullname,
      bio,
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllUsers(req, res) {
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

  const allowedSortFields = ["createdAt", "username", "fullname"];

  if (!allowedSortFields.includes(sortBy)) {
  return res.status(400).json({
    error: "sortBy must be one of: createdAt, username, fullname",
  });
  }

  if (!["asc", "desc"].includes(order)) {
  return res.status(400).json({
    error: "order must be asc or desc",
  });
  }
  const isPrivateQuery = req.query.isPrivate;
const search = req.query.search;

let isPrivate;

if (isPrivateQuery !== undefined) {
  if (!["true", "false"].includes(isPrivateQuery)) {
    return res.status(400).json({
      error: "isPrivate must be true or false",
    });
  }

  isPrivate = isPrivateQuery === "true";
}

  try {
    const result = await usersService.getAllUsers(
  page,
  limit,
  sortBy,
  order,
  {
    isPrivate,
    search,
  }
);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

async function getUserById(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateUser(req, res) {
  try {
    const { fullname, bio, isPrivate } = req.body;

    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const data = {};

    if (fullname !== undefined) data.fullname = fullname;
    if (bio !== undefined) data.bio = bio;
    if (isPrivate !== undefined) data.isPrivate = isPrivate;

    const updatedUser = await usersService.updateUser(req.params.id, data);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await usersService.deleteUser(req.params.id);

    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};
