import { Op } from "sequelize";
import TransactionHistory from "../models/TransactionHistoryModel.js";
import Chapter from "../models/ChapterModel.js";
import User from "../models/UserModel.js";

// 🔹 Helper untuk flatten response transaction
const flattenTransaction = (tr) => ({
  id: tr.id,
  uuid: tr.uuid,
  chapter_id: tr.chapter_id,
  chapter_title: tr.chapter?.title || null,
  chapter_img: tr.chapter?.img || null,
  user_id: tr.user_id,
  user_name: tr.collaborator?.name || null,
  checked_by_id: tr.checked_by_id,
  checker_name: tr.checker?.name || null,
  status: tr.status,
  notes: tr.notes,
  created_at: tr.createdAt,
  updated_at: tr.updatedAt,
});

// ✅ GET ALL TRANSACTION
export const getAllTransaction = async (req, res) => {
  try {
    const {
      cari = "",
      page = 0,
      per_page = 10,
      sort_by = "id",
      sort_type = "ASC",
    } = req.body;

    const offset = page * per_page;

    // Cari di notes atau chapter title
    const { rows, count } = await TransactionHistory.findAndCountAll({
      where: {
        [Op.or]: [
          { status: { [Op.like]: `%${cari}%` } },
          { notes: { [Op.like]: `%${cari}%` } },
        ],
      },
      include: [
        {
          model: Chapter,
          as: "chapter",
        },
        {
          model: User,
          as: "collaborator",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "checker",
          attributes: ["id", "name", "email", "phone"],
        },
      ],
      order: [[sort_by, sort_type]],
      limit: per_page,
      offset,
    });

    const data = rows.map((tr) => flattenTransaction(tr));

    res.json({
      message: "Daftar transaksi berhasil diambil",
      total: count,
      page,
      per_page,
      data,
    });
  } catch (error) {
    console.error("Error getAllTransaction:", error);
    res.status(500).json({ message: error.message });
  }
};
