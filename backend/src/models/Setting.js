import { DataTypes } from "sequelize";

export function initSetting(sequelize) {
  const Setting = sequelize.define(
    "Setting",
    {
      key: {
        type: DataTypes.STRING(100),
        primaryKey: true,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    { tableName: "settings", timestamps: true }
  );

  return Setting;
}
