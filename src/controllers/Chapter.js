import { Op } from "sequelize";
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
  deadline: chapter.deadline,
  status: chapter.status,
  payment_proof: chapter.payment_proof,
  notes: chapter.notes,
  expired_at: chapter.expired_at || null,
  book_id: chapter.book_id || null,
  book_title: chapter.book_title || null,
  book_description: chapter.book_description || null,
  book_img: chapter.book_img || null,
  category_id: chapter.category_id || null,
  category_name: chapter.category_name || null,
  checked_by_id: chapter.checked_by_id || null,
  checked_by_name: chapter.checked_by_name || null,
  checkout_by: chapter.checkout_by || null,
  checkout_by_name: chapter.checkout_by_name || null,
  checkout_by_email: chapter.checkout_by_email || null,
  checkout_by_phone: chapter.checkout_by_phone || null,
});

// ✅ CREATE
export const createChapter = async (req, res) => {
  try {
    const { chapter, title, price, deadline, book_id, img } = req.body;

    // Cek duplikat chapter pada book_id yang sama
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
      img, // URL dari frontend
      // status: "on_sale",
    });

    const book = await Book.findByPk(chapterData.book_id, {
      include: [{ model: Category, as: "category" }],
    });

    const flat = flattenChapter({
      ...chapterData.toJSON(),
      book_title: book?.title,
      book_description: book?.description,
      book_img: book?.img,
      category_id: book?.category?.id,
      category_name: book?.category?.name,
    });

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

    const data = rows.map((ch) =>
      flattenChapter({
        ...ch.toJSON(),
        book_title: ch.book?.title,
        book_description: ch.book?.description,
        book_img: ch.book?.img,
        category_id: ch.book?.category?.id,
        category_name: ch.book?.category?.name,
        checked_by_id: ch.checker?.id || null,
        checked_by_name: ch.checker?.name || null,
        checkout_by: ch.checkout?.id || null,
        checkout_by_name: ch.checkout?.name,
      })
    );

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
          include: [{ model: Category, as: "category" }],
        },
      ],
    });

    if (!ch) {
      return res.status(404).json({ message: "Chapter tidak ditemukan" });
    }

    const flat = flattenChapter({
      ...ch.toJSON(),
      book_title: ch.book?.title,
      book_description: ch.book?.description,
      book_img: ch.book?.img,
      category_id: ch.book?.category?.id,
      category_name: ch.book?.category?.name,
      checked_by_id: ch.checker?.id || null,
      checked_by_name: ch.checker?.name || null,
      checkout_by: ch.checkout?.id || null,
      checkout_by_name: ch.checkout?.name,
    });

    res.json({ message: "Detail chapter berhasil diambil", data: flat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE
export const updateChapter = async (req, res) => {
  try {
    const { id, chapter, title, price, deadline, book_id, img } = req.body;

    const chapterData = await Chapter.findByPk(id);
    if (!chapterData) {
      return res.status(404).json({
        message: "Chapter tidak ditemukan",
      });
    }

    // Cek duplikat chapter
    if (chapter) {
      const existing = await Chapter.findOne({
        where: { book_id, chapter },
      });
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

    const book = await Book.findByPk(chapterData.book_id, {
      include: [{ model: Category, as: "category" }],
    });

    const flat = flattenChapter({
      ...chapterData.toJSON(),
      book_title: book?.title,
      book_description: book?.description,
      book_img: book?.img,
      category_id: book?.category?.id,
      category_name: book?.category?.name,
    });

    return res.json({
      message: "Chapter berhasil diubah",
      data: flat,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE
export const deleteChapter = async (req, res) => {
  try {
    const { id } = req.body;
    const chapter = await Chapter.findByPk(id);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter tidak ditemukan" });
    }

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

    if (!id || !user_id) {
      return res.status(400).json({
        message: "id dan user_id wajib diisi",
      });
    }

    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter tidak ditemukan" });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

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
          attributes: ["id", "name", "email", "phone"],
        },
      ],
    });

    return res.json({
      message: "Chapter berhasil di-checkout",
      data: flattenChapter(updatedChapter),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ GET CHAPTERS BY CHECKOUT BY (POST body: { checkout_by, cari })
export const getChaptersByCheckoutBy = async (req, res) => {
  try {
    const { checkout_by, cari = "" } = req.body;

    if (!checkout_by) {
      return res.status(400).json({ message: "checkout_by wajib diisi" });
    }

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
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    const data = chapters.map((ch) =>
      flattenChapter({
        ...ch.toJSON(),
        book_title: ch.book?.title,
        book_description: ch.book?.description,
        book_img: ch.book?.img,
        category_id: ch.book?.category?.id,
        category_name: ch.book?.category?.name,
        checked_by_id: ch.checker?.id || null,
        checked_by_name: ch.checker?.name || null,
        checkout_by: ch.checkout?.id || null,
        checkout_by_name: ch.checkout?.name,
      })
    );

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
    const userId = req.userId; // dari middleware auth

    if (!id || !payment_proof) {
      return res.status(400).json({
        status: "error",
        message: "id dan payment_proof wajib diisi",
      });
    }

    const chapter = await Chapter.findByPk(id);
    if (!chapter) {
      return res.status(404).json({
        status: "error",
        message: "Chapter tidak ditemukan",
      });
    }

    // update chapter
    await chapter.update({
      payment_proof,
      status: "waiting",
    });

    // ambil chapter terbaru + relasi collaborator (user)
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
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    const data = flattenChapter({
      ...updatedChapter.toJSON(),
      book_title: updatedChapter.book?.title,
      book_description: updatedChapter.book?.description,
      book_img: updatedChapter.book?.img,
      category_id: updatedChapter.book?.category?.id,
      category_name: updatedChapter.book?.category?.name,
      checked_by_id: updatedChapter.checker?.id || null,
      checked_by_name: updatedChapter.checker?.name || null,
      checkout_by: updatedChapter.checkout?.id || null,
      checkout_by_name: updatedChapter.checkout?.name,
    });

    return res.status(200).json({
      status: "success",
      message: "Bukti pembayaran berhasil diupload",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// ✅ APPROVAL (Admin Approve / Reject)
export const approveChapter = async (req, res) => {
  try {
    const { id, checker_id, status, notes } = req.body;
    // status: "close" | "rejected"

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
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter tidak ditemukan" });
    }

    if (chapter.status !== "waiting") {
      return res.status(400).json({ message: "Chapter bukan status waiting" });
    }

    // Reset expired_at selalu null jika status close atau rejected
    let updatedData = {
      status,
      checked_by_id: checker_id,
      notes: notes || "-",
      expired_at: null,
    };

    if (status === "rejected") {
      updatedData.checkout_by = null;
    }

    await chapter.update(updatedData);
    // Jika status close, buat entry di Collaborator
    if (status === "close") {
      await Collaborator.create({
        collaborator_id: chapter.checkout_by, // sesuai model
        chapter_id: chapter.id,
      });
    }

    // Reload chapter agar data terbaru diambil
    await chapter.reload();

    // Buat entry di TransactionHistory
    await TransactionHistory.create({
      chapter_id: chapter.id,
      collaborator_id: chapter.checkout_by,
      checked_by_id: checker_id,
      status,
      notes: notes || "-",
    });

    const data = flattenChapter({
      ...chapter.toJSON(),
      book_title: chapter.book?.title,
      book_description: chapter.book?.description,
      book_img: chapter.book?.img,
      category_id: chapter.book?.category?.id,
      category_name: chapter.book?.category?.name,
      checked_by_id: chapter.checker?.id || null,
      checked_by_name: chapter.checker?.name || null,
      checkout_by: chapter.checkout?.id || null,
      checkout_by_name: chapter.checkout?.name,
    });

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

// ✅ Ambil data dengan status waiting
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
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
      ],
    });

    const data = chapters.map((ch) =>
      flattenChapter({
        ...ch.toJSON(),
        book_title: ch.book?.title,
        book_description: ch.book?.description,
        book_img: ch.book?.img,
        category_id: ch.book?.category?.id,
        category_name: ch.book?.category?.name,
        checked_by_id: ch.checker?.id || null,
        checked_by_name: ch.checker?.name || null,
        checkout_by: ch.checkout?.id || null,
        checkout_by_name: ch.checkout?.name,
        checkout_by_email: ch.checkout?.email || null,
        checkout_by_phone: ch.checkout?.phone || null,
      })
    );

    res.json({
      message: "Daftar chapter waiting berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ GET CHAPTERS BY CATEGORY (POST body: { category_id, cari })
export const getChaptersByCategory = async (req, res) => {
  try {
    const { category_id, cari = "" } = req.body;

    if (!category_id) {
      return res.status(400).json({ message: "category_id wajib diisi" });
    }

    const chapters = await Chapter.findAll({
      include: [
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name"],
        },
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

    const data = chapters.map((ch) =>
      flattenChapter({
        ...ch.toJSON(),
        book_title: ch.book?.title,
        book_description: ch.book?.description,
        book_img: ch.book?.img,
        category_id: ch.book?.category?.id,
        category_name: ch.book?.category?.name,
        checked_by_id: ch.checker?.id || null,
        checked_by_name: ch.checker?.name || null,
        checkout_by: ch.checkout?.id || null,
        checkout_by_name: ch.checkout?.name,
      })
    );

    res.json({
      message: "Daftar chapter berdasarkan category berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET CHAPTERS BY BOOK (POST body: { book_id, cari })
export const getChaptersByBook = async (req, res) => {
  try {
    const { book_id, cari = "" } = req.body;

    if (!book_id) {
      return res.status(400).json({ message: "book_id wajib diisi" });
    }

    const chapters = await Chapter.findAll({
      where: {
        book_id,
        [Op.or]: [
          { chapter: { [Op.like]: `%${cari}%` } },
          { title: { [Op.like]: `%${cari}%` } },
        ],
      },
      include: [
        {
          model: User,
          as: "checkout",
          attributes: ["id", "name"],
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
      order: [["id", "ASC"]],
    });

    const data = chapters.map((ch) =>
      flattenChapter({
        ...ch.toJSON(),
        book_title: ch.book?.title,
        book_description: ch.book?.description,
        book_img: ch.book?.img,
        category_id: ch.book?.category?.id,
        category_name: ch.book?.category?.name,
        checked_by_id: ch.checker?.id || null,
        checked_by_name: ch.checker?.name || null,
        checkout_by: ch.checkout?.id || null,
        checkout_by_name: ch.checkout?.name,
      })
    );

    res.json({
      message: "Daftar chapter berdasarkan book berhasil diambil",
      total: chapters.length,
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
