import { DataTypes } from "sequelize";

export function initPayment(sequelize) {
  const Payment = sequelize.define(
    "Payment",
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
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      monthPaid: {
        type: DataTypes.STRING(7),
        allowNull: false,
      },
      method: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      receiptPath: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    { tableName: "payments", timestamps: true }
  );
  return Payment;
}
