import { DataTypes } from "sequelize";

export function initStand(sequelize) {
  const Stand = sequelize.define(
    "Stand",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      zone: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      surface: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      monthlyRent: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("free", "occupied"),
        allowNull: false,
        defaultValue: "free",
      },
      currentVendorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
      },
    },
    { tableName: "stands", timestamps: true }
  );
  return Stand;
}
