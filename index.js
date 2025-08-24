import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./src/config/Database.js";
import { runSeed } from "./src/seed/seed.js";
import UserRoutes from "./src/routes/UserRoute.js";
import AdminRoutes from "./src/routes/AdminRoute.js";
import MemberRoutes from "./src/routes/MemberRoute.js";
import BookRoutes from "./src/routes/BookRoute.js";
import ChapterRoutes from "./src/routes/ChapterRoute.js";
import CheckOutRoutes from "./src/routes/CheckOutRoute.js";
import UserRoleRoutes from "./src/routes/UserRoleRoute.js";
import CategoryRoutes from "./src/routes/CategoryRoutes.js";
import AuthRoutes from "./src/routes/AuthRoute.js";

import Role from "./src/models/UserRoleModel.js";

dotenv.config();

const app = express();

runSeed();

try {
  await db.authenticate();
  console.log("Database connected...");
} catch (error) {
  console.log(error);
}

app.use(cors({ credentials: true, origin: true }));

morgan.token("statusMessage", (req, res) => {
  const code = res.statusCode;
  switch (code) {
    case 200:
      return "OK";
    case 201:
      return "Created";
    case 204:
      return "No Content";
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    case 500:
      return "Internal Server Error";
    default:
      return "";
  }
});

// Gunakan format custom
app.use(morgan(":method: :url [:status];; :statusMessage - :response-time ms"));
app.use(express.json());
app.use(cookieParser());
app.use(UserRoutes);
// app.use(AdminRoutes);
// app.use(MemberRoutes);
// app.use(BookRoutes);
// app.use(ChapterRoutes);
// app.use(CheckOutRoutes);
app.use(UserRoleRoutes);
app.use(CategoryRoutes);
app.use(AuthRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server Is Started On Port: " + process.env.PORT);
});

export { db };
