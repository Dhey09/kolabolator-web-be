import Category from "../models/CategoryModel.js";

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCategorys = async (req, res) => {
  try {
    const categorys = await Category.findAll();
    res.status(200).json(categorys);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { uuid: req.params.id } });
    if (!category)
      return res.status(404).json({ message: "Cateory not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { uuid: req.params.id } });
    if (!category)
      return res.status(404).json({ message: "Cateory not found" });
    await category.save();
    res.status(200).json({ message: "Cateory updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ where: { uuid: req.params.id } });
    if (!category)
      return res.status(404).json({ message: "Cateory not found" });
    await category.destroy();
    res.status(200).json({ message: "Cateory deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
