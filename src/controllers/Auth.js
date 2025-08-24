import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import Admin from "../models/AdminModel.js";
import Member from "../models/MemberModel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

// Step 1: Request OTP
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // cek di member dulu
    let user = await Member.findOne({ where: { email } });
    let userType = "member";

    if (!user) {
      user = await Admin.findOne({ where: { email } });
      userType = "admin";
    }

    if (!user)
      return res.status(404).json({ message: "Email tidak ditemukan" });

    // generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // simpan OTP + expired (5 menit)
    user.otp = otp;
    user.otp_expired = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // kirim email
    await sendEmail(
      email,
      "Reset Password OTP",
      `Kode OTP kamu adalah: ${otp}`
    );

    res.status(200).json({ message: "OTP dikirim ke email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 2: Verifikasi OTP & Reset Password
export const ResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    let user = await Member.findOne({ where: { email } });
    let userType = "member";

    if (!user) {
      user = await Admin.findOne({ where: { email } });
      userType = "admin";
    }

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (user.otp !== otp || new Date() > new Date(user.otp_expired)) {
      return res.status(400).json({ message: "OTP salah atau expired" });
    }

    // update password
    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    user.otp = null;
    user.otp_expired = null;
    await user.save();

    res.status(200).json({ message: "Password berhasil direset" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // cari di member dulu
    let user = await Member.findOne({ where: { username } });
    let userType = "member";

    // kalau tidak ada di member, cari di admin
    if (!user) {
      user = await Admin.findOne({ where: { username } });
      userType = "admin";
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await argon2.verify(user.password, password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const { id, name, roleId } = user;

    // buat token
    const accessToken = jwt.sign(
      { id, name, username, roleId, userType },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id, name, username, roleId, userType },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // simpan refresh token ke DB sesuai tipe user
    if (userType === "member") {
      await Member.update({ refresh_token: refreshToken }, { where: { id } });
    } else {
      await Admin.update({ refresh_token: refreshToken }, { where: { id } });
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken,
      refreshToken,
      id,
      name,
      username,
      roleId,
      userType,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const RefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    let user;
    if (decoded.userType === "member") {
      user = await Member.findOne({ where: { id: decoded.id } });
    } else {
      user = await Admin.findOne({ where: { id: decoded.id } });
    }

    if (!user) return res.sendStatus(403);

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        roleId: user.roleId,
        userType: decoded.userType,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken, refreshToken });
  } catch (err) {
    return res.sendStatus(403);
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (decoded.userType === "member") {
      await Member.update(
        { refresh_token: null },
        { where: { id: decoded.id } }
      );
    } else {
      await Admin.update(
        { refresh_token: null },
        { where: { id: decoded.id } }
      );
    }

    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(403);
  }
};
