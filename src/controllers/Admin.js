import Admin from "../models/AdminModel.js";
import UserRole from "../models/UserRoleModel.js";
import argon2 from "argon2";

export const createAdmin = async (req, res) => {
  const { name, email, username, password, confirmPassword } = req.body;
  if (password.length < 6) {
    return res.status(400).send({
      message: "Password must be at least 6 characters",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).send({
      message: "Passwords do not match",
    });
  }
  const hash = await argon2.hash(password);
  try {
    await Admin.create({
      name: name,
      email: email,
      username: username,
      password: hash,
      roleId: req.params.roleId,
    });
    res.status(201).json({
      message: "Admin created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const response = await Admin.findAll(
      {
        attributes: ["id", "name", "email", "username", "roleId"],
      }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const response = await Admin.findOne({
      attributes: ["id", "name", "email", "username"],
      where: {
        id: req.params.id,
      },
      include : [UserRole],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  const admin = await Admin.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  const { name, email, username, password, confirmPassword, role } = req.body;
  if (password.length < 6) {
    return res.status(400).send({
      message: "Password must be at least 6 characters",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).send({
      message: "Passwords do not match",
    });
  }
  const hash = await argon2.hash(password);
  try {
    await Admin.update(
      {
        name: name,
        email: email,
        username: username,
        password: hash,
        role: role,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json({
      message: "Admin updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAdmin = async (req, res) => {
  const admin = await Admin.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  try {
    await Admin.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      message: "Admin deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
