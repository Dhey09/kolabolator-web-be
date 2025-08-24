// controllers/UserController.js
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import User from "../models/UserModel.js";
import Role from "../models/UserRoleModel.js";

// Helper untuk flatten user jadi 1 object
const flattenUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  password: user.password, // hati2, ini password hash
  role_id: user.role_id,
  role_name: user.user_role ? user.user_role.role_name : null,
  name: user.name,
  phone: user.phone,
  gelar: user.gelar,
  pendidikan_akhir: user.pendidikan_akhir,
  tmpt_lahir: user.tmpt_lahir,
  tgl_lahir: user.tgl_lahir,
  jenis_kelamin: user.jenis_kelamin,
  agama: user.agama,
  pekerjaan: user.pekerjaan,
  alamat: user.alamat,
});

// CREATE USER
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirm_password,
      role_id,
      name,
      phone,
      gelar,
      pendidikan_akhir,
      tmpt_lahir,
      tgl_lahir,
      jenis_kelamin,
      agama,
      pekerjaan,
      alamat,
    } = req.body;

    if (password !== confirm_password) {
      return res.status(400).json({
        message: "Password dan Confirm Password tidak sama",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash,
      role_id,
      name,
      phone,
      gelar,
      pendidikan_akhir,
      tmpt_lahir,
      tgl_lahir,
      jenis_kelamin,
      agama,
      pekerjaan,
      alamat,
    });

    const role = await Role.findByPk(role_id);

    const result = {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role_id: user.role_id,
      role_name: role ? role.role_name : null,
      name: user.name,
      phone: user.phone,
      gelar: user.gelar,
      pendidikan_akhir: user.pendidikan_akhir,
      tmpt_lahir: user.tmpt_lahir,
      tgl_lahir: user.tgl_lahir,
      jenis_kelamin: user.jenis_kelamin,
      agama: user.agama,
      pekerjaan: user.pekerjaan,
      alamat: user.alamat,
    };

    return res.status(201).json({
      message: "success",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET ALL USERS (POST)
export const getAllUsers = async (req, res) => {
  try {
    const {
      cari = "",
      page = 0,
      per_page = 10,
      sort_by = "id",
      sort_type = "ASC",
    } = req.body;

    const where = {};
    if (cari) {
      where[Op.or] = [
        { username: { [Op.like]: `%${cari}%` } },
        { email: { [Op.like]: `%${cari}%` } },
        { name: { [Op.like]: `%${cari}%` } },
        { phone: { [Op.like]: `%${cari}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "role_name"],
        },
      ],
      order: [[sort_by, sort_type]],
      limit: per_page,
      offset: page * per_page,
    });

    const data = rows.map((u) => flattenUser(u));

    return res.status(200).json({
      message: "success",
      total: count,
      page,
      per_page,
      data,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET USER BY ID (POST)
export const getUserById = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: Role,
          as: "user_role",
          attributes: ["id", "role_name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "success",
      data: flattenUser(user),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE USER (POST)
export const updateUser = async (req, res) => {
  try {
    const {
      id,
      name,
      username,
      email,
      password,
      gelar,
      pendidikan_akhir,
      tmpt_lahir,
      tgl_lahir,
      jenis_kelamin,
      agama,
      pekerjaan,
      alamat,
    } = req.body;

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      name,
      username,
      email,
      gelar,
      pendidikan_akhir,
      tmpt_lahir,
      tgl_lahir,
      jenis_kelamin,
      agama,
      pekerjaan,
      alamat,
    };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await User.update(updateData, { where: { id } });

    const updatedUser = await User.findOne({
      where: { id },
      include: [
        {
          model: Role,
          as: "user_role",
          attributes: ["id", "role_name"],
        },
      ],
    });

    return res.status(200).json({
      message: "success",
      data: flattenUser(updatedUser),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "ID harus diisi",
      });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        message: "Gagal Menghapus User",
      });
    }

    const userName = user.name; // ambil nama user sebelum dihapus
    await user.destroy();

    return res.status(200).json({
      message: `User dengan nama ${userName} Berhasil Dihapus`,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Gagal Menghapus User",
    });
  }
};
