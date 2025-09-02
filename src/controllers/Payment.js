import Payment from "../models/PaymentModel.js";
import { Op } from "sequelize";

// CREATE
export const createPayment = async (req, res) => {
  try {
    const { bank, bank_rek, name } = req.body;

    if (!bank || !bank_rek || !name) {
      return res.status(400).json({ success: false, message: "Semua field wajib diisi" });
    }

    const payment = await Payment.create({ bank, bank_rek, name });

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// READ ALL (pagination + search + sort)
export const getAllPayments = async (req, res) => {
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
        { bank: { [Op.like]: `%${cari}%` } },
        { bank_rek: { [Op.like]: `%${cari}%` } },
        { name: { [Op.like]: `%${cari}%` } },
      ];
    }

    const offset = page * per_page;

    const { count, rows } = await Payment.findAndCountAll({
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

// READ BY ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.body;
    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
export const updatePayment = async (req, res) => {
  try {
    const { id, bank, bank_rek, name } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    await payment.update({
      bank: bank ?? payment.bank,
      bank_rek: bank_rek ?? payment.bank_rek,
      name: name ?? payment.name,
    });

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.body;

    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    await payment.destroy();
    res.json({ success: true, message: "Payment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
