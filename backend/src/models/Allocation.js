import { DataTypes } from "sequelize";

export function initAllocation(sequelize) {
  const Allocation = sequelize.define(
    "Allocation",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "vendor_id",
        references: { model: "vendors", key: "id" },
      },
      stallId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "stall_id",
        references: { model: "stalls", key: "id" },
      },
      startDate: { type: DataTypes.DATEONLY, allowNull: false, field: "start_date" },
      endDate: { type: DataTypes.DATEONLY, allowNull: true, field: "end_date" },
    },
    { tableName: "allocations", timestamps: true }
  );

  return Allocation;
}
