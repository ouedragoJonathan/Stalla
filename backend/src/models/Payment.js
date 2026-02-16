import { DataTypes } from "sequelize";

export function initPayment(sequelize) {
  const Payment = sequelize.define(
    "Payment",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      allocationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "allocation_id",
        references: { model: "allocations", key: "id" },
      },
      amountPaid: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: "amount_paid" },
      paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "payment_date",
      },
      period: { type: DataTypes.STRING(7), allowNull: false },
      receiptPath: { type: DataTypes.STRING(255), allowNull: true, field: "receipt_path" },
    },
    { tableName: "payments", timestamps: true }
  );

  return Payment;
}
