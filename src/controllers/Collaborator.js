// controllers/CollaboratorController.js
import { Op } from "sequelize";
import Collaborator from "../models/CollaboratorModel.js";
import Chapter from "../models/ChapterModel.js";
import User from "../models/UserModel.js";

// 🔹 global flattener supaya tidak nested
const flattenCollaborator = (c) => ({
  id: c.id,
  chapter_id: c.chapter_id,
  chapter_title: c.chapter ? c.chapter.title : null,
  collaborator_id: c.collaborator_id,
  collaborator_name: c.collab ? c.collab.name : null,
  reviewer_id: c.reviewer_id,
  reviewer_name: c.reviewer ? c.reviewer.name : null,
  script: c.script,
  haki: c.haki,
  identity: c.identity,
  address: c.address,
  status: c.status,
  notes: c.notes,
});

// 🔹 Get All Collaborators
export const getAllCollaborators = async (req, res) => {
  const {
    cari = "",
    page = 0,
    per_page = 10,
    sort_by = "id",
    sort_type = "ASC",
  } = req.body;

  try {
    const offset = page * per_page;

    const { count, rows } = await Collaborator.findAndCountAll({
      include: [
        {
          model: Chapter,
          as: "chapter",
          attributes: ["title"],
          where: cari ? { title: { [Op.like]: `%${cari}%` } } : undefined,
        },
        {
          model: User,
          as: "collab",
          attributes: ["name"],
          where: undefined, // filter collaborator jika dibutuhkan
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["name"],
          where: undefined, // filter reviewer jika dibutuhkan
        },
      ],
      where: cari
        ? {
            [Op.or]: [{ notes: { [Op.like]: `%${cari}%` } }],
          }
        : undefined,
      limit: per_page,
      offset,
      order: [[sort_by, sort_type]],
    });

    return res.status(200).json({
      status: "success",
      message: "Data collaborator berhasil diambil",
      total: count,
      page,
      per_page,
      data: rows.map(flattenCollaborator),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Gagal mengambil data collaborators",
      error: error.message,
    });
  }
};

// 📌 Get Collaborator By Id
export const getCollaboratorById = async (req, res) => {
  try {
    const { id } = req.body;

    const collaborator = await Collaborator.findOne({
      where: { id },
      include: [
        { model: Chapter, as: "chapter", attributes: ["id", "title"] },
        { model: User, as: "collab", attributes: ["id", "name"] },
        { model: User, as: "reviewer", attributes: ["id", "name"] },
      ],
    });

    if (!collaborator) {
      return res.status(404).json({
        status: "error",
        message: "Collaborator tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Detail collaborator berhasil diambil",
      data: flattenCollaborator(collaborator),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

// 📌 Get Collaborator By Chapter
export const getCollaboratorByChapter = async (req, res) => {
  try {
    const { chapter_id } = req.body;

    if (!chapter_id) {
      return res.status(400).json({
        status: "error",
        message: "chapter_id wajib dikirimkan",
      });
    }

    const collaborators = await Collaborator.findAll({
      where: { chapter_id },
      include: [
        { model: Chapter, as: "chapter", attributes: ["id", "title"] },
        { model: User, as: "collab", attributes: ["id", "name"] },
        { model: User, as: "reviewer", attributes: ["id", "name"] },
      ],
      order: [["id", "ASC"]],
    });

    if (!collaborators || collaborators.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Tidak ada collaborator pada chapter ini",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Data collaborator per chapter berhasil diambil",
      total: collaborators.length,
      data: collaborators.map(flattenCollaborator),
    });
  } catch (error) {
    console.error("❌ Error getCollaboratorByChapter:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

// 📌 Get Personal Collaborator (by collaborator_id)
export const getPersonalCollaborator = async (req, res) => {
  try {
    const { collaborator_id } = req.body;

    const collaborators = await Collaborator.findAll({
      where: { collaborator_id },
      include: [
        { model: Chapter, as: "chapter", attributes: ["id", "title"] },
        { model: User, as: "collab", attributes: ["id", "name"] },
        { model: User, as: "reviewer", attributes: ["id", "name"] },
      ],
    });

    if (!collaborators || collaborators.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Data personal collaborator tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Data personal collaborator berhasil diambil",
      data: collaborators.map(flattenCollaborator),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

// Update data oleh Collaborator
export const updateCollaboratorData = async (req, res) => {
  try {
    const { id, script, haki, identity, address } = req.body;

    const collaborator = await Collaborator.findOne({ where: { id } });
    if (!collaborator) {
      return res.status(404).json({
        status: "error",
        message: "Collaborator tidak ditemukan",
      });
    }

    collaborator.script = script || collaborator.script;
    collaborator.haki = haki || collaborator.haki;
    collaborator.identity = identity || collaborator.identity;
    collaborator.address = address || collaborator.address;

    // Cek kelengkapan
    if (
      collaborator.script &&
      collaborator.haki &&
      collaborator.identity &&
      collaborator.address
    ) {
      collaborator.status = "pending";
      collaborator.uploaded_at = new Date();
    } else {
      collaborator.status = "need_complete";
    }

    await collaborator.save();

    return res.status(200).json({
      status: "success",
      message: "Data collaborator berhasil diperbarui",
      data: flattenCollaborator(collaborator),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

//Approve oleh Admin
export const approveCollaborator = async (req, res) => {
  try {
    const { id, reviewer_id } = req.body;

    const collaborator = await Collaborator.findOne({ where: { id } });
    if (!collaborator) {
      return res.status(404).json({
        status: "error",
        message: "Collaborator tidak ditemukan",
      });
    }

    collaborator.status = "uploaded";
    collaborator.reviewer_id = reviewer_id;
    collaborator.reviewed_at = new Date();

    await collaborator.save();

    return res.status(200).json({
      status: "success",
      message: "Collaborator berhasil diapprove",
      data: flattenCollaborator(collaborator),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

// Send Back oleh Admin
export const sendBackCollaborator = async (req, res) => {
  try {
    const { id, notes, reviewer_id } = req.body;

    const collaborator = await Collaborator.findOne({ where: { id } });
    if (!collaborator) {
      return res.status(404).json({
        status: "error",
        message: "Collaborator tidak ditemukan",
      });
    }

    collaborator.status = "need_update";
    collaborator.notes = notes;
    collaborator.reviewer_id = reviewer_id;
    collaborator.reviewed_at = new Date();

    await collaborator.save();

    return res.status(200).json({
      status: "success",
      message: "Collaborator dikembalikan untuk perbaikan",
      data: flattenCollaborator(collaborator),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};
