// controllers/CollaboratorController.js
import { Op } from "sequelize";
import Collaborator from "../models/CollaboratorModel.js";
import Chapter from "../models/ChapterModel.js";
import User from "../models/UserModel.js";
import Book from "../models/BookModel.js";
import Category from "../models/CategoryModel.js";
import ExcelJS from "exceljs";

// 🔹 global flattener supaya tidak nested
const flattenCollaborator = (c) => ({
  id: c.id,
  category_id: c.chapter.book.category ? c.chapter.book.category.id : null,
  category_name: c.chapter.book.category ? c.chapter.book.category.name : null,
  book_id: c.chapter.book ? c.chapter.book.id : null,
  book_title: c.chapter.book ? c.chapter.book.title : null,
  chapter_id: c.chapter_id,
  chapter_section: c.chapter ? c.chapter.chapter : null,
  chapter_title: c.chapter ? c.chapter.title : null,
  chapter_payment_proof: c.chapter ? c.chapter.payment_proof : null,
  collaborator_id: c.collaborator_id,
  collaborator_name: c.collab ? c.collab.name : null,
  collaborator_gelar: c.collab ? c.collab.gelar : null,
  collaborator_email: c.collab ? c.collab.email : null,
  collaborator_phone: c.collab ? c.collab.phone : null,
  reviewer_id: c.reviewer_id,
  reviewer_name: c.reviewer ? c.reviewer.name : null,
  script: c.script,
  haki: c.haki,
  identity: c.identity,
  address: c.address,
  status: c.status,
  notes: c.notes,
  reviewed_at: c.reviewed_at,
  createdAt: c.createdAt,
});

const flattenForExport = (c) => ({
  kategori_buku: c.chapter.book.category?.name || null,
  judul_buku: c.chapter.book?.title || null,
  bagian: c.chapter?.chapter || null,
  judul_bagian: c.chapter?.title || null,
  harga_bagian: c.chapter?.price || null,
  deadline_bagian: c.chapter?.deadline || null,
  nama_kolaborator: c.chapter.checkout?.name || null,
  email_kolaborator: c.chapter.checkout?.email || null,
  no_hp_kolaborator: c.chapter.checkout?.phone || null,
  bukti_pembayaran: c.chapter?.payment_proof || null,
  naskah: c.script || null,
  haki: c.haki || null,
  ktp: c.identity || null,
  alamat: c.address || null,
  pembayaran_di_cek_oleh: c.chapter.checker?.name || null,
  dokumen_di_cek_oleh: c.reviewer?.name,
});

export const exportCollaborators = async (req, res) => {
  try {
    const collaborators = await Collaborator.findAll({
      include: [
        {
          model: Chapter,
          as: "chapter",
          attributes: [
            "id",
            "title",
            "chapter",
            "price",
            "deadline",
            "payment_proof",
          ],
          include: [
            {
              model: User,
              as: "checkout",
              attributes: ["id", "name", "email", "phone"],
            },
            {
              model: User,
              as: "checker",
              attributes: ["id", "name"],
            },
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
              model: User,
              as: "reviewer",
              attributes: ["id", "name"],
            },
      ],
    });
    const data = collaborators.map(flattenForExport);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Collaborators");

    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key,
      width: 25,
    }));

    worksheet.addRows(data);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=collaborators.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Error export:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

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
          attributes: ["id", "title", "chapter", "payment_proof"],
          where: cari ? { title: { [Op.like]: `%${cari}%` } } : undefined,
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
          where: undefined, // filter collaborator jika dibutuhkan
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name"],
          where: undefined, // filter reviewer jika dibutuhkan
        },
      ],
      where: cari
        ? {
            [Op.or]: [
              { notes: { [Op.like]: `%${cari}%` } },
              { status: { [Op.like]: `%${cari}%` } },
            ],
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
        {
          model: Chapter,
          as: "chapter",
          attributes: ["id", "title", "chapter", "payment_proof"],
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
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
        {
          model: Chapter,
          as: "chapter",
          attributes: ["id", "title", "chapter", "payment_proof"],
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
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
        {
          model: Chapter,
          as: "chapter",
          attributes: ["id", "title", "chapter", "payment_proof"],
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
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

    const collaborator = await Collaborator.findOne({
      where: { id },
      include: [
        {
          model: Chapter,
          as: "chapter",
          attributes: ["id", "title", "chapter", "payment_proof"],
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name"],
        },
      ],
    });
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

    const collaborator = await Collaborator.findOne({
      where: { id },
      include: [
        {
          model: Chapter,
          as: "chapter",
          attributes: ["id", "title", "chapter", "payment_proof"],
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name"],
        },
      ],
    });
    if (!collaborator) {
      return res.status(404).json({
        status: "error",
        message: "Collaborator tidak ditemukan",
      });
    }

    collaborator.status = "completed";
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

    const collaborator = await Collaborator.findOne({
      where: { id },
      include: [
        {
          model: Chapter,
          as: "chapter",
          attributes: ["id", "title", "chapter", "payment_proof"],
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name"],
        },
      ],
    });
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

// 📌 Get Collaborators by Status Pending
export const getPendingCollaborators = async (req, res) => {
  try {
    const {
      page = 0,
      per_page = 10,
      sort_by = "id",
      sort_type = "ASC",
    } = req.body;
    const offset = page * per_page;

    const { count, rows } = await Collaborator.findAndCountAll({
      where: { status: "pending" },
      include: [
        {
          model: Chapter,
          as: "chapter",
          attributes: ["id", "title", "chapter", "payment_proof"],
          include: [
            {
              model: Book,
              as: "book",
              attributes: ["id", "title"],
              include: [
                {
                  model: Category,
                  as: "category",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: "collab",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "name"],
        },
      ],
      limit: per_page,
      offset,
      order: [[sort_by, sort_type]],
    });

    return res.status(200).json({
      status: "success",
      message: "Data collaborator dengan status pending berhasil diambil",
      total: count,
      page,
      per_page,
      data: rows.map(flattenCollaborator),
    });
  } catch (error) {
    console.error("❌ Error getPendingCollaborators:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
