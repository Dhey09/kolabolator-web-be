import Book from "../models/BookModel.js";

export const createBook = async (req, res) => {
  const { title, author, description } = req.body;
  try {
    const book = await Book.create({
      title: title,
      author: author,
      description: description,
    });
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      attributes: ["id", "uuid", "title", "author", "description"],
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id },
      attributes: ["uuid", "title", "author", "description"],
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  const book = await Book.findOne({ where: { id: req.params.id } });
  if (!book) return res.status(404).json({ message: "Book not found" });
  const { title, author, description } = req.body;
  try {
    await Book.update({
      title: title,
      author: author,
      description: description,
    }, {
      where: { id: req.params.id },
    })
    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { id: req.params.id } });
    if (!book) return res.status(404).json({ message: "Book not found" });
    await book.destroy();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
