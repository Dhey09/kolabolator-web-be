import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Step 1: Request OTP
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
    }

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

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    if (user.otp !== otp || new Date() > new Date(user.otp_expired)) {
      return res.status(400).json({ message: "OTP salah atau expired" });
    }

    // update password dengan bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otp_expired = null;
    await user.save();

    res.status(200).json({ message: "Password berhasil direset" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Step 3: Login
export const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const { id, name, role_id } = user;

    // buat token
    const accessToken = jwt.sign(
      { id, name, username, role_id: role_id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id, name, username, role_id: role_id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // simpan refresh token
    await User.update({ refresh_token: refreshToken }, { where: { id } });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login success",
      data: {
        accessToken,
        refreshToken,
        id,
        name,
        username,
        role_id: role_id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Step 4: Refresh Token
export const RefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user || user.refresh_token !== refreshToken) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        role_id: user.role_id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ accessToken, refreshToken });
  } catch (err) {
    return res.sendStatus(403);
  }
};

// Step 5: Logout
export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    await User.update(
      { refresh_token: null },
      { where: { id: decoded.id } }
    );

    res.clearCookie("refreshToken");
    return res.sendStatus(200);
  } catch (err) {
    return res.sendStatus(403);
  }
};
