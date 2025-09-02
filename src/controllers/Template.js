import Template from "../models/TemplateModel.js";
import { Op } from "sequelize";

// CREATE
export const createTemplate = async (req, res) => {
  try {
    const { script_url, haki_url } = req.body;

    if (!script_url || !haki_url) {
      return res.status(400).json({
        success: false,
        message: "script_url dan haki_url wajib diisi",
      });
    }

    const template = await Template.create({
      script: script_url,
      haki: haki_url,
    });

    res.json({
      success: true,
      message: "Template berhasil dibuat",
      data: template,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL (pagination + search + sort)
export const getAllTemplates = async (req, res) => {
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
        { script: { [Op.like]: `%${cari}%` } },
        { haki: { [Op.like]: `%${cari}%` } },
      ];
    }

    const offset = page * per_page;
    const { count, rows } = await Template.findAndCountAll({
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

// GET BY ID
export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.body;
    const template = await Template.findByPk(id);

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    res.json({ success: true, data: template });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
export const updateTemplate = async (req, res) => {
  try {
    const { id, script_url, haki_url } = req.body;
    const template = await Template.findByPk(id);

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    await template.update({
      script: script_url || template.script,
      haki: haki_url || template.haki,
    });

    res.json({
      success: true,
      message: "Template berhasil diperbarui",
      data: template,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.body;
    const template = await Template.findByPk(id);

    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: "Template not found" });
    }

    await template.destroy();
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Download Script Template (cukup redirect ke link Cloudinary)
export const downloadScriptTemplate = async (req, res) => {
  try {
    const { link_download } = req.body;
    if (!link_download) {
      return res.status(400).json({ message: "link_download wajib diisi" });
    }
    return res.redirect(link_download);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download HAKI Template (cukup redirect ke link Cloudinary)
export const downloadHakiTemplate = async (req, res) => {
  try {
    const { link_download } = req.body;
    if (!link_download) {
      return res.status(400).json({ message: "link_download wajib diisi" });
    }
    return res.redirect(link_download);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
