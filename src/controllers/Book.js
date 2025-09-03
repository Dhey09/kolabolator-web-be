// controllers/BookController.js
import { Op } from "sequelize";
import xlsx from "xlsx";
import path from "path";
import fs from "fs";
import Book from "../models/BookModel.js";
import Category from "../models/CategoryModel.js";
import Chapter from "../models/ChapterModel.js";
import Collaborator from "../models/CollaboratorModel.js";

// helper untuk flatten data
const flattenBook = (book, stats = {}) => ({
  id: book.id,
  img: book.img,
  title: book.title,
  category_id: book.category_id,
  category_name: book.category ? book.category.name : null,
  description: book.description,
  status: book.status,
  createdAt: book.createdAt,
  total_collaborator: stats.total_collaborator || 0,
  total_completed_collaborator: stats.total_completed_collaborator || 0,
});

// Hitung statistic collaborator per book
const getBookStats = async (bookId) => {
  const collaborators = await Collaborator.findAll({
    include: [
      {
        model: Chapter,
        as: "chapter",
        required: true,
        where: { book_id: bookId },
      },
    ],
  });

  const total_collaborator = collaborators.length;
  const total_completed_collaborator = collaborators.filter(
    (c) => c.script && c.haki && c.identity
  ).length;

  return { total_collaborator, total_completed_collaborator };
};

// CREATE Book
export const createBook = async (req, res) => {
  try {
    const { title, category_id, description, img } = req.body;

    const newBook = await Book.create({
      img: img || null, // ambil dari frontend
      title,
      category_id,
      description,
    });

    const stats = await getBookStats(newBook.id);

    return res.status(201).json({
      message: "Book created successfully",
      data: flattenBook(newBook, stats),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET ALL Books
export const getAllBooks = async (req, res) => {
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
        { title: { [Op.like]: `%${cari}%` } },
        { description: { [Op.like]: `%${cari}%` } },
      ];
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
      order: [[sort_by, sort_type]],
      limit: per_page,
      offset: page * per_page,
    });

    const dataWithStats = [];
    for (const book of rows) {
      const stats = await getBookStats(book.id);

      // Auto update status kalau sudah ≥50% collaborator selesai upload
      const chapters = await Chapter.count({ where: { book_id: book.id } });
      if (
        chapters > 0 &&
        stats.total_completed_collaborator >= Math.ceil(chapters / 2) &&
        book.status === "draft"
      ) {
        await book.update({ status: "editing" });
      }

      dataWithStats.push(flattenBook(book, stats));
    }

    return res.status(200).json({
      message: "success",
      total: count,
      page,
      per_page,
      data: dataWithStats,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET Book BY ID
export const getBookById = async (req, res) => {
  try {
    const { id } = req.body;
    const book = await Book.findByPk(id, {
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
    });

    if (!book) return res.status(404).json({ message: "Book not found" });

    const stats = await getBookStats(book.id);

    return res
      .status(200)
      .json({ message: "success", data: flattenBook(book, stats) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET Books BY CATEGORY_ID
export const getBookByCategoryId = async (req, res) => {
  try {
    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({ message: "category_id wajib diisi" });
    }

    const books = await Book.findAll({
      where: { category_id },
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
      ],
      order: [["id", "ASC"]],
    });

    const dataWithStats = [];
    for (const book of books) {
      const stats = await getBookStats(book.id);

      // Auto update status kalau sudah ≥50% collaborator selesai upload
      const chapters = await Chapter.count({ where: { book_id: book.id } });
      if (
        chapters > 0 &&
        stats.total_completed_collaborator >= Math.ceil(chapters / 2) &&
        book.status === "draft"
      ) {
        await book.update({ status: "editing" });
      }

      dataWithStats.push(flattenBook(book, stats));
    }

    return res.status(200).json({
      message: "Daftar book berdasarkan category berhasil diambil",
      total: books.length,
      data: dataWithStats,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE Book
export const updateBook = async (req, res) => {
  try {
    const { id, title, category_id, description, img } = req.body;
    const book = await Book.findByPk(id);

    if (!book) return res.status(404).json({ message: "Book not found" });

    await book.update({
      title: title || book.title,
      category_id: category_id || book.category_id,
      description: description || book.description,
      img: img !== undefined ? img : book.img,
    });

    const stats = await getBookStats(book.id);

    return res.status(200).json({
      message: "Book updated successfully",
      data: flattenBook(book, stats),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE Book
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.body;
    const book = await Book.findByPk(id);

    if (!book) return res.status(404).json({ message: "Book not found" });

    await book.destroy();

    return res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// UPDATE STATUS Book → admin trigger
export const updateBookStatus = async (req, res) => {
  try {
    const { id, status, isbn_confirmation } = req.body;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const allowedStatus = [
      "draft",
      "editing",
      "isbn_submission",
      "published",
      "printed",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Validasi wajib isbn_confirmation kalau status = "isbn_submission"
    if (
      status === "isbn_submission" &&
      (!isbn_confirmation || isbn_confirmation.trim() === "")
    ) {
      return res.status(400).json({
        message:
          "isbn_confirmation is required when status is 'isbn_submission'",
      });
    }

    // object update dinamis
    const updateData = { status };

    // update isbn_confirmation hanya kalau ada
    if (isbn_confirmation !== undefined) {
      updateData.isbn_confirmation = isbn_confirmation;
    }

    await book.update(updateData);

    return res.status(200).json({
      message: "Book status updated successfully",
      status: "success",
      data: flattenBook(book),
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: "error",
    });
  }
};

export const downloadBookTemplate = async (req, res) => {
  try {
    const headers = [
      [
        "title",
        "description",
        "category_id",
      ],
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(headers);
    xlsx.utils.book_append_sheet(wb, ws, "Book");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=book_template.xlsx"
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

// Import Book
export const importBook = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "File tidak ditemukan" });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    for (const row of rows) {
      await Book.create({
        title: row.title,
        description: row.description,
        category_id: row.category_id,
      });
    }

    fs.unlinkSync(req.file.path);
    res.json({ message: "Import book berhasil", total: rows.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
