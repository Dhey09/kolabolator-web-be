import cron from "node-cron";
import Chapter from "../models/ChapterModel.js";
import { Op } from "sequelize";

// Jalankan cron setiap 1 menit (bisa disesuaikan)
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const chapters = await Chapter.findAll({
      where: {
        status: "pending",
        expired_at: { [Op.lte]: now },
      },
    });

    for (const ch of chapters) {
      await ch.update({
        status: "on_sale",
        expired_at: null,
        checkout_by: null,
      });
      console.log(`Chapter ID ${ch.id} di-reset ke on_sale karena expired`);
    }
  } catch (err) {
    console.error("Error cron reset chapter:", err.message);
  }
});
