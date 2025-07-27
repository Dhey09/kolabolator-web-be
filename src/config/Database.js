import { Sequelize } from "sequelize";

const db = new Sequelize('book_colaboration', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

export default db;