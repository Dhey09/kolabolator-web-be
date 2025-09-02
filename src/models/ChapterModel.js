import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Book from "./BookModel.js";
import User from "./UserModel.js";
const { DataTypes } = Sequelize;

const Chapter = db.define(
  "chapter",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    img: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    chapter: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    deadline: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM("open", "pending", "waiting", "close", "rejected"),
      defaultValue: "open",
    },
    payment_proof: { type: DataTypes.STRING },
    notes: { type: DataTypes.TEXT },

    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Book,
        key: "id",
      },
    },
    checked_by_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    checkout_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    collaborated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: "id",
      },
    },
    expired_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ["book_id", "chapter"],
      },
    ],
  }
);

Book.hasMany(Chapter, { foreignKey: "book_id", as: "chapters" });
Chapter.belongsTo(Book, { foreignKey: "book_id", as: "book" });

Chapter.belongsTo(User, { foreignKey: "checked_by_id", as: "checker" });
Chapter.belongsTo(User, { foreignKey: "checkout_by", as: "checkout" });
Chapter.belongsTo(User, { foreignKey: "collaborated_by", as: "collaborator" });

export default Chapter;
