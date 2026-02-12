import { DataTypes } from "sequelize";

export function initStand(sequelize) {
  const Stand = sequelize.define(
    "Stand",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      zone: { type: DataTypes.STRING(100), allowNull: false },
      monthlyPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "monthly_price" },
      status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "AVAILABLE" },
    },
    { tableName: "stalls", timestamps: true }
  );

  return Stand;
}
