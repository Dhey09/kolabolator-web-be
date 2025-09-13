import { Op } from "sequelize";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import Chapter from "../models/ChapterModel.js";
import Book from "../models/BookModel.js";
import Category from "../models/CategoryModel.js";
import Collaborator from "../models/CollaboratorModel.js";
import TransactionHistory from "../models/TransactionHistoryModel.js";
import User from "../models/UserModel.js";

// 🔹 Helper untuk flatten response
const flattenChapter = (chapter) => ({
  id: chapter.id,
  uuid: chapter.uuid,
  img: chapter.img,
  chapter: chapter.chapter,
  title: chapter.title,
  price: chapter.price,
  createdAt: chapter.createdAt,
  deadline: chapter.deadline,
  status: chapter.status,
  payment_proof: chapter.payment_proof,
  notes: chapter.notes,
  expired_at: chapter.expired_at || null,
  book_id: chapter.book_id || chapter.book?.id || null,
  book_title: chapter.book_title || chapter.book?.title || null,
  book_description:
    chapter.book_description || chapter.book?.description || null,
  book_img: chapter.book_img || chapter.book?.img || null,
  category_id: chapter.category_id || chapter.book?.category?.id || null,
  category_name: chapter.category_name || chapter.book?.category?.name || null,
  checked_by_id: chapter.checked_by_id || chapter.checker?.id || null,
  checked_by_name: chapter.checked_by_name || chapter.checker?.name || null,
  checkout_by: chapter.checkout_by || chapter.checkout?.id || null,
  checkout_by_name: chapter.checkout_by_name || chapter.checkout?.name || null,
  checkout_by_gelar: chapter.checkout_by_gelar || chapter.checkout?.gelar || null,
  checkout_by_email:
    chapter.checkout_by_email || chapter.checkout?.email || null,
  checkout_by_phone:
    chapter.checkout_by_phone || chapter.checkout?.phone || null,
});

// ✅ CREATE
export const createChapter = async (req, res) => {
  try {
    const { chapter, title, price, deadline, book_id, img } = req.body;

    const existing = await Chapter.findOne({ where: { book_id, chapter } });
    if (existing) {
      return res.status(400).json({
        message: `Chapter ${chapter} sudah ada pada book_id ${book_id}`,
      });
    }

    const chapterData = await Chapter.create({
      chapter,
      title,
      price,
      deadline,
      book_id,
      img,
    });

    const chapterWithRelations = await Chapter.findByPk(chapterData.id, {
      include: [
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
      ],
    });

    const flat = flattenChapter(chapterWithRelations.toJSON());

    return res.status(201).json({
      message: "Chapter berhasil dibuat",
      data: flat,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL
export const getChapters = async (req, res) => {
  try {
    const {
      cari = "",
      page = 0,
      per_page = 10,
      sort_by = "id",
      sort_type = "ASC",
    } = req.body;

    const offset = page * per_page;

    const { rows, count } = await Chapter.findAndCountAll({
      where: {
        [Op.or]: [
          { chapter: { [Op.like]: `%${cari}%` } },
          { title: { [Op.like]: `%${cari}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
      ],
      order: [[sort_by, sort_type]],
      limit: per_page,
      offset,
    });

    const data = rows.map((ch) => flattenChapter(ch.toJSON()));

    res.json({
      message: "Daftar chapter berhasil diambil",
      total: count,
      page,
      per_page,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET BY ID
export const getChapterById = async (req, res) => {
  try {
    const { id } = req.body;

    const ch = await Chapter.findByPk(id, {
      include: [
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
      ],
    });

    if (!ch)
      return res.status(404).json({ message: "Chapter tidak ditemukan" });

    const flat = flattenChapter(ch.toJSON());

    res.json({ message: "Detail chapter berhasil diambil", data: flat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE
export const updateChapter = async (req, res) => {
  try {
    const { id, chapter, title, price, deadline, book_id, img } = req.body;

    const chapterData = await Chapter.findByPk(id, {
      include: [
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        { model: User, as: "checker", attributes: ["id", "name"] },
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
      ],
    });

    if (!chapterData)
      return res.status(404).json({ message: "Chapter tidak ditemukan" });

    if (chapter) {
      const existing = await Chapter.findOne({ where: { book_id, chapter } });
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({
          message: `Chapter ${chapter} sudah ada pada book_id ${book_id}`,
        });
      }
    }

    await chapterData.update({
      chapter: chapter || chapterData.chapter,
      title: title || chapterData.title,
      price: price || chapterData.price,
      deadline: deadline || chapterData.deadline,
      book_id: book_id || chapterData.book_id,
      img: img || chapterData.img,
    });

    await chapterData.reload();

    const flat = flattenChapter(chapterData.toJSON());

    return res.json({ message: "Chapter berhasil diubah", data: flat });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.body;
    const chapter = await Chapter.findByPk(id);

    if (!chapter)
      return res.status(404).json({ message: "Chapter tidak ditemukan" });

    await chapter.destroy();
    res.json({ message: "Chapter berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ CHECKOUT CHAPTER
export const checkoutChapter = async (req, res) => {
  try {
    const { id, user_id } = req.body;

    if (!id || !user_id)
      return res.status(400).json({ message: "id dan user_id wajib diisi" });

    const chapter = await Chapter.findByPk(id);
    if (!chapter)
      return res.status(404).json({ message: "Chapter tidak ditemukan" });

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    await chapter.update({
      status: "pending",
      expired_at: expiredAt,
      checkout_by: user_id,
    });

    const updatedChapter = await Chapter.findByPk(id, {
      include: [
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
      ],
    });

    return res.json({
      message: "Chapter berhasil di-checkout",
      data: flattenChapter(updatedChapter.toJSON()),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ GET CHAPTERS BY CHECKOUT BY
export const getChaptersByCheckoutBy = async (req, res) => {
  try {
    const { checkout_by, cari = "" } = req.body;
    if (!checkout_by)
      return res.status(400).json({ message: "checkout_by wajib diisi" });

    const chapters = await Chapter.findAll({
      where: {
        checkout_by,
        [Op.or]: [
          { chapter: { [Op.like]: `%${cari}%` } },
          { title: { [Op.like]: `%${cari}%` } },
        ],
      },
      include: [
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        { model: User, as: "checker", attributes: ["id", "name"] },
      ],
      order: [["id", "ASC"]],
    });

    const data = chapters.map((ch) => flattenChapter(ch.toJSON()));

    res.json({
      message: "Daftar chapter berdasarkan checkout_by berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPLOAD PAYMENT PROOF
export const uploadPaymentProof = async (req, res) => {
  try {
    const { id, payment_proof } = req.body;
    if (!id || !payment_proof)
      return res
        .status(400)
        .json({ status: "error", message: "id dan payment_proof wajib diisi" });

    const chapter = await Chapter.findByPk(id);
    if (!chapter)
      return res
        .status(404)
        .json({ status: "error", message: "Chapter tidak ditemukan" });

    await chapter.update({ payment_proof, status: "waiting" });

    const updatedChapter = await Chapter.findByPk(id, {
      include: [
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        { model: User, as: "checker", attributes: ["id", "name"] },
      ],
    });

    const data = flattenChapter(updatedChapter.toJSON());

    return res.status(200).json({
      status: "success",
      message: "Bukti pembayaran berhasil diupload",
      data,
    });
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

// ✅ APPROVAL (Admin Approve / Reject)
export const approveChapter = async (req, res) => {
  try {
    const { id, checker_id, status, notes } = req.body;

    const chapter = await Chapter.findByPk(id, {
      include: [
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        { model: User, as: "checker", attributes: ["id", "name"] },
      ],
    });

    if (!chapter)
      return res.status(404).json({ message: "Chapter tidak ditemukan" });
    if (chapter.status !== "waiting")
      return res.status(400).json({ message: "Chapter bukan status waiting" });

    let updatedData = {
      status,
      checked_by_id: checker_id,
      notes: notes || "-",
      expired_at: null,
    };
    if (status === "rejected") updatedData.checkout_by = null;

    await chapter.update(updatedData);

    if (status === "close") {
      await Collaborator.create({
        collaborator_id: chapter.checkout_by,
        chapter_id: chapter.id,
      });
    }

    await chapter.reload();

    // await TransactionHistory.create({
    //   chapter_id: chapter.id,
    //   collaborator_id: chapter.checkout_by,
    //   checked_by_id: checker_id,
    //   status,
    //   notes: notes || "-",
    // });

    const data = flattenChapter(chapter.toJSON());

    return res.json({
      message: `Chapter berhasil ${
        status === "close" ? "diapprove" : "direject"
      }`,
      data,
    });
  } catch (error) {
    console.error("Error approveChapter:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ✅ GET WAITING CHAPTERS
export const getWaitingChapters = async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: { status: "waiting" },
      include: [
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        { model: User, as: "checker", attributes: ["id", "name"] },
      ],
    });

    const data = chapters.map((ch) => flattenChapter(ch.toJSON()));

    res.json({
      message: "Daftar chapter waiting berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionLists = async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      where: {
        status: {
          [Op.or]: ["waiting", "close"],
        },
      },
      include: [
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name", "email", "phone", "gelar"],
        },
        { model: User, as: "checker", attributes: ["id", "name"] },
      ],
    });

    const data = chapters.map((ch) => flattenChapter(ch.toJSON()));

    res.json({
      message: "Daftar list transaksi berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET CHAPTERS BY CATEGORY
export const getChaptersByCategory = async (req, res) => {
  try {
    const { category_id, cari = "" } = req.body;
    if (!category_id)
      return res.status(400).json({ message: "category_id wajib diisi" });

    const chapters = await Chapter.findAll({
      include: [
        { model: User, as: "checkout", attributes: ["id", "name"] },
        { model: User, as: "checker", attributes: ["id", "name"] },
        {
          model: Book,
          as: "book",
          where: { category_id },
          include: [{ model: Category, as: "category" }],
        },
      ],
      where: {
        [Op.or]: [
          { chapter: { [Op.like]: `%${cari}%` } },
          { title: { [Op.like]: `%${cari}%` } },
        ],
      },
      order: [["id", "ASC"]],
    });

    const data = chapters.map((ch) => flattenChapter(ch.toJSON()));

    res.json({
      message: "Daftar chapter berdasarkan category berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET CHAPTERS BY BOOK
export const getChaptersByBook = async (req, res) => {
  try {
    const { book_id, cari = "" } = req.body;
    if (!book_id)
      return res.status(400).json({ message: "book_id wajib diisi" });

    const chapters = await Chapter.findAll({
      where: {
        book_id,
        [Op.or]: [
          { chapter: { [Op.like]: `%${cari}%` } },
          { title: { [Op.like]: `%${cari}%` } },
        ],
      },
      include: [
        { model: User, as: "checkout", attributes: ["id", "name"] },
        { model: User, as: "checker", attributes: ["id", "name"] },
        {
          model: Book,
          as: "book",
          include: [{ model: Category, as: "category" }],
        },
      ],
      order: [["id", "ASC"]],
    });

    const data = chapters.map((ch) => flattenChapter(ch.toJSON()));

    res.json({
      message: "Daftar chapter berdasarkan book berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadChapterTemplate = async (req, res) => {
  try {
    const headers = [["chapter", "title", "price", "deadline", "book_id"]];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(headers);
    xlsx.utils.book_append_sheet(wb, ws, "Chapter");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=chapter_template.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Import Chapter
export const importChapter = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "File tidak ditemukan" });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    for (const row of rows) {
      await Chapter.create({
        chapter: row.chapter,
        title: row.title,
        price: row.price,
        deadline: row.deadline,
        book_id: row.book_id,
      });
    }

    fs.unlinkSync(req.file.path);
    res.json({ message: "Import chapter berhasil", total: rows.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
