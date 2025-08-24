// models/User.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Role from "./UserRoleModel.js";

const { DataTypes } = Sequelize;

const User = db.define(
  "users",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    otp: DataTypes.STRING,
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
    jenis_kelamin: { type: DataTypes.ENUM("Laki-laki", "Perempuan"), allowNull: true },
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
      defaultValue: "-",
    },
  },
  { freezeTableName: true }
);

// Relasi
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

export default User;
