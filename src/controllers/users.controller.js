
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
  try {
    const users = await usersService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
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
