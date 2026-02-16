import { DataTypes } from "sequelize";

export function initVendor(sequelize) {
  const Vendor = sequelize.define(
    "Vendor",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: "user_id",
        references: { model: "Users", key: "id" },
      },
      fullName: { type: DataTypes.STRING(120), allowNull: false, field: "full_name" },
      phone: { type: DataTypes.STRING(30), allowNull: false, unique: true },
      businessType: { type: DataTypes.STRING(120), allowNull: false, field: "business_type" },
    },
    { tableName: "vendors", timestamps: true }
  );

  return Vendor;
}
