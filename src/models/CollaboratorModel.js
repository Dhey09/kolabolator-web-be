// models/CollaboratorModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Chapter from "./ChapterModel.js";
import User from "./UserModel.js";

const { DataTypes } = Sequelize;

const Collaborator = db.define(
  "collaborator",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    script: { type: DataTypes.TEXT, allowNull: true }, // naskah
    haki: { type: DataTypes.TEXT, allowNull: true }, // sertifikat HAKI
    identity: { type: DataTypes.TEXT, allowNull: true }, // KTP
    address: { type: DataTypes.TEXT, allowNull: true, defaultValue: "" }, // alamat wajib diisi
    status: {
      type: DataTypes.ENUM(
        "need_complete",
        "pending",
        "uploaded",
        "need_update"
      ),
      defaultValue: "need_complete",
    },
    notes: { type: DataTypes.TEXT, allowNull: true }, // catatan untuk need_update
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    uploaded_at: { type: DataTypes.DATE, allowNull: true },
    reviewed_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    freezeTableName: true,
  }
);

// relasi
Collaborator.belongsTo(Chapter, { foreignKey: "chapter_id", as: "chapter" });
Collaborator.belongsTo(User, {
  foreignKey: "collaborator_id",
  as: "collab",
});
Collaborator.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

export default Collaborator;
