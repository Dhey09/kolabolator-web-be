import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Book from "./BookModel.js";
import Member from "./MemberModel.js";

const { DataTypes } = Sequelize;

const Chapter = db.define(
  "chapter",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    part: {
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
   
    deadline: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    bookedBy:{
      type: DataTypes.INTEGER,
      references:{
        model: Member,
        key: "id"
      }
    },
    bookId: {
      type: DataTypes.INTEGER,
      references: {
        model: Book,
        key: "id",
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Book.hasMany(Chapter, { foreignKey: "bookId" });
Member.hasMany(Chapter, {foreignKey: "bookedBy"});
Chapter.belongsTo(Member, { foreignKey: "bookedBy" });
Chapter.belongsTo(Book, { foreignKey: "bookId" });

export default Chapter;
