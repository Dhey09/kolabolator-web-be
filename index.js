import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./src/config/Database.js";
import AdminRoutes from "./src/routes/AdminRoute.js";
import MemberRoutes from "./src/routes/MemberRoute.js";
import BookRoutes from "./src/routes/BookRoute.js";
import ChapterRoutes from "./src/routes/ChapterRoute.js";
import CheckOutRoutes from "./src/routes/CheckOutRoute.js";
import UserRoleRoutes from "./src/routes/UserRoleRoute.js";
import AuthRoutes from "./src/routes/AuthRoute.js";

dotenv.config();

const app = express();

db.sync();

try {
  await db.authenticate();
  console.log("Database connected...");
} catch (error) {
  console.log(error);
}

app.use(cors({ credentials: true, origin: true }));

app.use(express.json());
app.use(cookieParser());
app.use(AdminRoutes);
app.use(MemberRoutes);
app.use(BookRoutes);
app.use(ChapterRoutes);
app.use(CheckOutRoutes);
app.use(UserRoleRoutes);
app.use(AuthRoutes);


app.listen(process.env.PORT, () => {
  console.log(
    "=================================\n||-------------/|/-------------||\n||- Server Is Started On Port -||\n||----------  " +
      process.env.PORT +
      "  -----------||\n||-------  " +
      "Kolaborasi Buku" +
      "  --------||\n================================\n  ============================  "
  );
});

export { db };
