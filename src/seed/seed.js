import db from "../config/Database.js";
import Role from "../models/UserRoleModel.js";
import User from "../models/UserModel.js";
import bcrypt from "bcrypt";

export const seedRoles = async () => {
  const count = await Role.count();
  if (count === 0) {
    await Role.bulkCreate([
      { id: 1, role_name: "superadmin" },
      { id: 2, role_name: "admin" },
      { id: 3, role_name: "reviewer" },
      { id: 4, role_name: "member" },
    ]);
    console.log("✅ Default roles inserted");
  } else {
    console.log("ℹ️ Roles already exist, skipping seeding.");
  }
};

export const seedSuperAdmin = async () => {
  const superAdmin = await User.findOne({ where: { role_id: 1 } });
  if (!superAdmin) {
    const hashedPassword = await bcrypt.hash("superadmin123", 10);
    await User.create({
      name: "Super Admin",
      username: "superadmin",
      email: "superadmin@example.com",
      password: hashedPassword,
      role_id: 1,
    });
    console.log("✅ Default superadmin user created (username: superadmin, password: superadmin123)");
  } else {
    console.log("ℹ️ Superadmin user already exists, skipping seeding.");
  }
};

export const runSeed = async () => {
  try {
    await db.sync({ alter: true });
    await seedRoles();
    await seedSuperAdmin();
  } catch (err) {
    console.error("❌ Error seeding:", err);
  }
};
