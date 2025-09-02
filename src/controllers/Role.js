import UserRole from "../models/RoleModel.js";
import { Op } from "sequelize";

// CREATE
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Role name wajib diisi" });
    }

    const role = await UserRole.create({
      role_name: name,
    });

    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL (pagination + search + sort)
export const getAllRoles = async (req, res) => {
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
      where[Op.or] = [{ role_name: { [Op.like]: `%${cari}%` } }];
    }

    const offset = page * per_page;
    const { count, rows } = await UserRole.findAndCountAll({
      where,
      order: [[sort_by, sort_type]],
      limit: per_page,
      offset,
    });

    res.json({
      success: true,
      total: count,
      page,
      per_page,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BY ID
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID wajib diisi" });
    }

    const role = await UserRole.findByPk(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role tidak ditemukan" });
    }

    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
export const updateRole = async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID wajib diisi" });
    }

    const role = await UserRole.findByPk(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role tidak ditemukan" });
    }

    await role.update({
      role_name: name ?? role.role_name,
    });

    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID wajib diisi" });
    }

    const role = await UserRole.findByPk(id);

    if (!role) {
      return res.status(404).json({ success: false, message: "Role tidak ditemukan" });
    }

    await role.destroy();
    res.json({ success: true, message: "Role berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
