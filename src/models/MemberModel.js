import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import UserRole from "./UserRoleModel.js";

const { DataTypes } = Sequelize;

const Member = db.define(
  "member",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: UserRole,
        key: "id",
      },
      allowNull: false,
      validate: {
        notEmpty: true,
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
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    agama: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    pekerjaan: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    no_hp: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
    alamat: {
      type: DataTypes.STRING,
      defaultValue: "-",
    },
  },
  {
    freezeTableName: true,
  }
);

UserRole.hasMany(Member, { foreignKey: "roleId" });
Member.belongsTo(UserRole, { foreignKey: "roleId" });


export default Member;
