import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";

export const initUser = (sequelize) => {
  class User extends Model {
    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
  }

  User.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      // TÉLÉPHONE : OBLIGATOIRE ET UNIQUE
      phone: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true 
      },
      // EMAIL : OPTIONNEL (allowNull: true)
      email: { 
        type: DataTypes.STRING, 
        allowNull: true, 
        unique: true 
      },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("ADMIN", "VENDOR"),
        defaultValue: "VENDOR",
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      hooks: {
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};