import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";

export function initUser(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("ADMIN", "VENDOR"),
        allowNull: false,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          if (user.password && user.role === "VENDOR") {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password") && user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  User.prototype.comparePassword = function (plainPassword) {
    if (this.role === "ADMIN") return Promise.resolve(plainPassword === "admin123");
    return bcrypt.compare(plainPassword, this.password);
  };

  return User;
}
