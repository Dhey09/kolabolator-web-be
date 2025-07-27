import Chapter from "../models/ChapterModel.js";
import Checkout from "../models/CheckOutModel.js";
import Book from "../models/BookModel.js";
import Member from "../models/MemberModel.js";

export const createChapter = async (req, res) => {
  const { part, title, deadline } = req.body;
  try {
    const chapter = await Chapter.create({
      part: part,
      title: title,
      deadline: deadline,
      bookId: req.params.bookId,
    });
    res.status(201).json(chapter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.findAll({
      attributes: ["id", "part", "title", "deadline"],
      include: [Book],
    });
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChaptersByBookId = async (req, res) => {
  const { bookId } = req.params;

  if (!bookId) {
    return res.status(400).json({ message: "Book ID is required" });
  }

  try {
    const chapters = await Chapter.findAll({
      attributes: ["id", "part", "title", "deadline", "bookedBy"],
      where: {
        bookId: bookId,
      },
      include: [
        {
          model: Book,
          attributes: ["id", "title", "author", "description"],
        },
        {
          model: Member,
          attributes: ["id", "name"],
        },
      ],
    });

    if (chapters.length === 0) {
      return res
        .status(404)
        .json({ message: "No chapters found for the given book ID" });
    }

    const book = await Book.findOne({
      attributes: ["id", "title", "author", "description"],
      where: {
        id: bookId,
      },
    });

    res.status(200).json({ book, chapters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getChapterById = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({
      where: { id: req.params.id },
      attributes: ["id", "part", "title", "deadline"],
      include: [Book],
    });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ where: { id: req.params.id } });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const { part, title, deadline, bookId } = req.body;

    const updatedFields = {
      part: part,
      title: title,
      deadline: deadline,
    };

    if (bookId) {
      updatedFields.bookId = bookId;
    }

    await Chapter.update(updatedFields, { where: { id: req.params.id } });
    res.status(200).json({ message: "Chapter updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findOne({ where: { id: req.params.id } });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    await chapter.destroy();
    res.status(200).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const chapterId = req.params.id;
    if (!req.userId) return res.status(401).json({ message: 'User not authenticated' });

    const chapter = await Chapter.findOne({ where: { id: chapterId } });
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    const member = await Member.findOne({ where: { id: req.userId } });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const book = await Book.findOne({ where: { id: chapter.bookId } });
    if (!book) return res.status(404).json({ message: "Book not found" });



    const checkout = await Checkout.create({
      memberId: req.userId,
      chapterId: chapterId,
      bookId: chapter.bookId,
    });

    res.status(201).json({
      message: "Checkout successful",
      chapter,
      checkout,
      book,
      member,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


