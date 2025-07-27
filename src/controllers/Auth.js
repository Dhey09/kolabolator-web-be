import Admin from "../models/AdminModel.js";
import Member from "../models/MemberModel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

export const LoginMember = async (req, res) => {
  try {
    const member = await Member.findOne({
      where: { username: req.body.username },
    });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const match = await argon2.verify(member.password, req.body.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const { id, name, username, roleId } = member;

    const accessToken = jwt.sign(
      { id, name, username, roleId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id, name, username, roleId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await Member.update(
      { refresh_token: refreshToken },
      { where: { id: member.id } }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken, refreshToken, name, username, roleId, id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const LoginAdmin = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      where: { username: req.body.username },
    });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const match = await argon2.verify(admin.password, req.body.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const { id, name, username, roleId } = admin;

    const accessToken = jwt.sign(
      { id, name, username, roleId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id, name, username, roleId },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await Admin.update(
      { refresh_token: refreshToken },
      { where: { id: admin.id } }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ accessToken, refreshToken, name, username, roleId, id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const RefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const member =
      (await Member.findOne({ where: { id: decoded.id } })) ||
      (await Admin.findOne({ where: { id: decoded.id } }));
    if (!member) return res.sendStatus(403);

    const accessToken = jwt.sign(
      {
        id: member.id,
        name: member.name,
        username: member.username,
        roleId: member.roleId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ accessToken, refreshToken });
  } catch (err) {
    return res.sendStatus(403);
  }
};

export const LogoutMember = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  try {
    const member = await Member.findOne({
      where: { refresh_token: refreshToken },
    });
    if (!member) {
      res.clearCookie("refreshToken");
      return res.sendStatus(204);
    }

    member.refresh_token = null;
    await member.save();
    res.clearCookie("refreshToken");
    return res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const LogoutAdmin = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    const admin = await Admin.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!admin) {
      return res.sendStatus(204);
    }

    await Admin.update(
      { refresh_token: null },
      {
        where: {
          id: admin.id,
        },
      }
    );

    res.clearCookie("refreshToken");
    res.setHeader("Authorization", "");
    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Terjadi kesalahan saat logout" });
  }
};
