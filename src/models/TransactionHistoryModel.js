import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UserModel.js";
import Chapter from "./ChapterModel.js";

const { DataTypes } = Sequelize;

const Transaction = db.define(
  "transaction_history",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Chapter,
        key: "id",
      },
    },
    collaborator_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    checked_by_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    notes: {
      type: DataTypes.TEXT,
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

Transaction.belongsTo(Chapter, { foreignKey: "chapter_id", as: "chapter" });
Transaction.belongsTo(User, { foreignKey: "user_id", as: "collaborator" });
Transaction.belongsTo(User, { foreignKey: "checked_by_id", as: "checker" });

export default Transaction;
