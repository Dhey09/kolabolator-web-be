// models/User.js
// Yang di type: DataTypes.STRING(36) itu buat max value
// kalo di validate: { len: [0, 15] } itu buat validasi, minimal(0) karakter maximal(15) karakter
// set validasi buat data type STRING sama INTEGER aja, TEXT sama DATE biarin default
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Role from "./RoleModel.js";

const { DataTypes } = Sequelize;

const User = db.define(
  "users",
  {
    uuid: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    img: { type: DataTypes.TEXT },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [0, 100],
      },
    },
    phone: {
      type: DataTypes.STRING,
      validate: { len: [0, 15] },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    otp: {
      type: DataTypes.STRING,
      validate: { len: [0, 6] },
    },
    otp_expired: DataTypes.DATE,
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    gelar: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    pendidikan_akhir: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    tmpt_lahir: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    tgl_lahir: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    jenis_kelamin: {
      type: DataTypes.ENUM("Laki-laki", "Perempuan"),
      allowNull: true,
    },
    agama: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    pekerjaan: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    alamat: {
      type: DataTypes.TEXT,
    },
  },
  { freezeTableName: true }
);

// Relasi
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

export default User;
