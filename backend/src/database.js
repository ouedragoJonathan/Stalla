import { Sequelize } from "sequelize";
import { config } from "./config.js";
import { initUser } from "./models/User.js";
import { initVendor } from "./models/Vendor.js";
import { initVendorApplication } from "./models/VendorApplication.js";
import { initStand } from "./models/Stand.js";
import { initAllocation } from "./models/Allocation.js";
import { initPayment } from "./models/Payment.js";
import { initSetting } from "./models/Setting.js";

const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: "mysql",
  logging: false,
});

const User = initUser(sequelize);
const Vendor = initVendor(sequelize);
const VendorApplication = initVendorApplication(sequelize);
const Stand = initStand(sequelize);
const Allocation = initAllocation(sequelize);
const Payment = initPayment(sequelize);
const Setting = initSetting(sequelize);

User.hasOne(Vendor, { foreignKey: "userId", as: "vendorProfile" });
Vendor.belongsTo(User, { foreignKey: "userId", as: "user" });

Vendor.hasMany(Allocation, { foreignKey: "vendorId", as: "allocations" });
Allocation.belongsTo(Vendor, { foreignKey: "vendorId", as: "vendor" });

Stand.hasMany(Allocation, { foreignKey: "stallId", as: "allocations" });
Allocation.belongsTo(Stand, { foreignKey: "stallId", as: "stall" });

Allocation.hasMany(Payment, { foreignKey: "allocationId", as: "payments" });
Payment.belongsTo(Allocation, { foreignKey: "allocationId", as: "allocation" });

export { sequelize, User, Vendor, VendorApplication, Stand, Allocation, Payment, Setting };

export async function initDatabase() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });
}
