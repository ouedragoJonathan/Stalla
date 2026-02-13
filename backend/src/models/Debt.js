import { DataTypes } from "sequelize";

export function initDebt(sequelize) {
  const Debt = sequelize.define(
    "Debt",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      vendorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      standId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "stands", key: "id" },
      },
      month: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    { tableName: "debts", timestamps: true }
  );
  return Debt;
}
