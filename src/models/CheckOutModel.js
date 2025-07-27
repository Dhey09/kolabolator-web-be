import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Member from "./MemberModel.js";
import Chapter from "./ChapterModel.js";
import Book from "./BookModel.js";

const { DataTypes } = Sequelize;

const Checkout = db.define(
  "checkout",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
      allowNull: false,
    },
    
    memberId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Member,
        key: "id",
      },
    },
    chapterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Chapter,
        key: "id",
      },
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
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



Member.hasMany(Checkout, { foreignKey: "memberId" });
Checkout.belongsTo(Member, { foreignKey: "memberId" });

Chapter.hasMany(Checkout, { foreignKey: "chapterId" });
Checkout.belongsTo(Chapter, { foreignKey: "chapterId" });

Book.hasMany(Checkout, { foreignKey: "bookId" });
Checkout.belongsTo(Book, { foreignKey: "bookId" });

export default Checkout;
