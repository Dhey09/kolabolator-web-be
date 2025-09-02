// controllers/CategoryController.js
import Category from "../models/CategoryModel.js";
import { Op } from "sequelize";

// Helper untuk flatten
const flattenCategory = (category) => ({
  id: category.id,
  name: category.name,
  img: category.img,
  description: category.description,
});

// CREATE Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, img } = req.body;

    const category = await Category.create({
      name,
      description: description || null,
      img: img || null, // langsung ambil URL dari frontend
    });

    res.status(201).json({
      message: "Category created successfully",
      data: flattenCategory(category),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL Categories (POST dengan pagination & search)
export const getCategories = async (req, res) => {
  try {
    let {
      cari = "",
      page = 0,
      per_page = 10,
      sort_by = "id",
      sort_type = "ASC",
    } = req.body;

    const offset = page * per_page;
    const whereCondition = cari
      ? {
          [Op.or]: [{ name: { [Op.like]: `%${cari}%` } }],
        }
      : {};

    const { count, rows } = await Category.findAndCountAll({
      where: whereCondition,
      offset,
      limit: per_page,
      order: [[sort_by, sort_type]],
    });

    res.json({
      total: count,
      page: parseInt(page),
      per_page: parseInt(per_page),
      data: rows.map(flattenCategory),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Category BY ID (POST)
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.body;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ message: "success", data: flattenCategory(category) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Category (POST)
export const updateCategory = async (req, res) => {
  try {
    const { id, name, description, img } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({
      name: name || category.name,
      description: description || category.description,
      img: img !== undefined ? img : category.img, // update kalau ada URL baru
    });

    res.json({
      message: "Category updated successfully",
      data: flattenCategory(category),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE Category (POST dengan body id)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
