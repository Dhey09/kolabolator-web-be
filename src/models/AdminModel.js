import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import UserRole from "./UserRoleModel.js";

const { DataTypes } = Sequelize;

const Admin = db.define(
  "admin",
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
    },
    password: {
      type: DataTypes.STRING,
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
  },
  {
    freezeTableName: true,
  }
);

UserRole.hasMany(Admin, { foreignKey: "roleId"});
Admin.belongsTo(UserRole, { foreignKey: "roleId" });

export default Admin;
