import { Sequelize } from "sequelize";
import { config } from "./config.js";
import { initUser } from "./models/User.js";
import { initStand } from "./models/Stand.js";
import { initDebt } from "./models/Debt.js";
import { initPayment } from "./models/Payment.js";

const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: "mysql",
  logging: false,
});

const User = initUser(sequelize);
const Stand = initStand(sequelize);
const Debt = initDebt(sequelize);
const Payment = initPayment(sequelize);

Stand.belongsTo(User, { foreignKey: "currentVendorId", as: "User" });
User.hasMany(Stand, { foreignKey: "currentVendorId" });

Debt.belongsTo(User, { foreignKey: "vendorId" });
Debt.belongsTo(Stand, { foreignKey: "standId", as: "Stand" });
User.hasMany(Debt, { foreignKey: "vendorId" });
Stand.hasMany(Debt, { foreignKey: "standId" });

Payment.belongsTo(User, { foreignKey: "vendorId", as: "User" });
Payment.belongsTo(Stand, { foreignKey: "standId", as: "Stand" });
User.hasMany(Payment, { foreignKey: "vendorId" });
Stand.hasMany(Payment, { foreignKey: "standId" });

export { sequelize, User, Stand, Debt, Payment };

export async function initDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
  const adminCount = await User.count({ where: { role: "ADMIN" } });
  if (adminCount === 0) {
    await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "admin123",
      role: "ADMIN",
    });
  }
}
