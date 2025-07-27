import Checkout from "../models/CheckOutModel.js";
import Chapter from "../models/ChapterModel.js";
import Member from "../models/MemberModel.js";
import { Op, where } from "sequelize";
import Book from "../models/BookModel.js";

export const createCheckout = async (req, res) => {
  const { chapterId } = req.body;
  const memberId = req.memberId;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  try {
    const checkout = await Checkout.create({
      memberId,
      chapterId,
      expiresAt,
    });
    res.status(201).json(checkout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCheckouts = async (req, res) => {
  try {
    if (req.roleId === 2) {
      const checkouts = await Checkout.findAll({
        include: [Member, Chapter, Book],
      });
      return res.status(200).json(checkouts);
    }

    if (req.roleId === 1) {
      if (!req.memberId)
        return res.status(403).json({ message: "Member ID is not defined" });

      const checkouts = await Checkout.findAll({
        attributes: ["id", "date", "chapterId", "bookId", "status"],
        include: [Member, Chapter, Book],
        where: {
          memberId: req.memberId,
        },
      });
      return res.status(200).json(checkouts);
    }

    res.status(403).json({ message: "Forbidden" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCheckout = async (req, res) => {
  const { paymentProof } = req.body;

  try {
    const checkout = await Checkout.findOne({
      where: { id: req.params.id },
    });

    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    checkout.paymentProof = paymentProof;
    checkout.status = "waiting approval";
    await checkout.save();

    res.status(200).json({ message: "Checkout updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const approveCheckout = async (req, res) => {
  try {
    const checkout = await Checkout.findOne({
      where: { id: req.params.id },
    });

    if (!checkout) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    const chapter = await Chapter.findOne({
      where: { id: checkout.chapterId },
    });

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    chapter.bookedBy = checkout.memberId;
    await chapter.save();

    checkout.status = "approved";
    await checkout.save();

    res
      .status(200)
      .json({ message: "Checkout approved and Chapter updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectCheckout = async (req, res) => {
  try {
    const checkout = await Checkout.findOne({
      where: { id: req.params.id },
    });

    if (!checkout)
      return res.status(404).json({ message: "Checkout not found" });

    checkout.status = "rejected";
    await checkout.save();

    res.status(200).json({ message: "Checkout rejected successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
