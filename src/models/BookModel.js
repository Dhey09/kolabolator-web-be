import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Category from "./CategoryModel.js";

const { DataTypes } = Sequelize;

const Book = db.define(
  "book",
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.STRING,
    },

    isbn_confirmation: { type: DataTypes.TEXT },

    status: {
      type: DataTypes.ENUM(
        "draft",
        "editing",
        "isbn_submission",
        "published",
        "printed"
      ),
      defaultValue: "draft",
    },

    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Category.hasMany(Book, { foreignKey: "category_id", as: "books" });
Book.belongsTo(Category, { foreignKey: "category_id", as: "category" });

export default Book;
