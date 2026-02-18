import { DataTypes } from "sequelize";

export function initVendorApplication(sequelize) {
  const VendorApplication = sequelize.define(
    "VendorApplication",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      fullName: { type: DataTypes.STRING(120), allowNull: false, field: "full_name" },
      phone: { type: DataTypes.STRING(30), allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      businessType: { type: DataTypes.STRING(200), allowNull: true, field: "business_type" },
      desiredZone: { type: DataTypes.STRING(120), allowNull: false, field: "desired_zone" },
      desiredCategory: {
        type: DataTypes.ENUM("STANDARD", "PREMIUM"),
        allowNull: true,
        field: "desired_category",
      },
      budgetMin: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "budget_min" },
      budgetMax: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "budget_max" },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
        allowNull: false,
        defaultValue: "PENDING",
      },
    },
    { tableName: "vendor_applications", timestamps: true }
  );

  return VendorApplication;
}

