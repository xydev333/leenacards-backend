'use strict';
module.exports = (sequelize, DataTypes) => {
  const admins = sequelize.define('admins', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: DataTypes.STRING,
    support_email: DataTypes.STRING,
    support_call_number: DataTypes.STRING,
    support_chat_number: DataTypes.STRING,
    terms: DataTypes.TEXT,
    privacy: DataTypes.TEXT,
    alternate_phone: DataTypes.STRING,
    password: DataTypes.TEXT,
    role: DataTypes.STRING,
    balance_limit: DataTypes.INTEGER,
    profile_image: DataTypes.STRING,
    last_login_at: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{
    indexes: [
      {
          unique: true,
          fields: ['email']
      }
    ]
  });

  return admins;
};