import Member from "../models/MemberModel.js";
import UserRole from "../models/UserRoleModel.js";
import argon2 from "argon2";

export const createMember = async (req, res) => {
  const {
    name,
    email,
    username,
    password,
    confirmPassword,
    no_hp,
  } = req.body;
  if (password.length < 6) {
    return res.status(400).send({
      message: "Password must be at least 6 characters",
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).send({
      message: "Passwords do not match",
    });
  }
  const hash = await argon2.hash(password);
  try {
    await Member.create({
      name: name,
      email: email,
      username: username,
      password: hash,
      roleId: req.params.roleId,
      no_hp: no_hp,
    });
    res.status(201).json({
      message: "Member created successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMembers = async (req, res) => {
  try {
    const response = await Member.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "username",
        "gelar",
        "roleId",
        "pendidikan_akhir",
        "tmpt_lahir",
        "tgl_lahir",
        "jenis_kelamin",
        "agama",
        "pekerjaan",
        "no_hp",
        "alamat",
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const response = await Member.findOne({
      attributes: [
        "id",
        "name",
        "email",
        "username",
        "roleId",
        "gelar",
        "pendidikan_akhir",
        "tmpt_lahir",
        "tgl_lahir",
        "jenis_kelamin",
        "agama",
        "pekerjaan",
        "no_hp",
        "alamat",
      ],
      where: {
        id: req.params.id,
      },
      include : [UserRole],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await Member.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const {
      name,
      email,
      username,
      role,
      gelar,
      pendidikan_akhir,
      tmpt_lahir,
      tgl_lahir,
      jenis_kelamin,
      agama,
      pekerjaan,
      no_hp,
      alamat,
    } = req.body;

    await Member.update(
      {
        name: name,
        email: email,
        username: username,
        role: role,
        gelar: gelar,
        pendidikan_akhir: pendidikan_akhir,
        tmpt_lahir: tmpt_lahir,
        tgl_lahir: tgl_lahir,
        jenis_kelamin: jenis_kelamin,
        agama: agama,
        pekerjaan: pekerjaan,
        no_hp: no_hp,
        alamat: alamat,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    res.status(200).json({
      message: "Member updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  const member = await Member.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!member) return res.status(404).json({ message: "Member not found" });
  try {
    await Member.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      message: "Member deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
