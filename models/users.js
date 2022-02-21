'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    alternate_phone: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.TEXT,
    role: DataTypes.STRING,
    profile_image: DataTypes.STRING,
    first_login_ip: DataTypes.STRING,
    last_login_ip: DataTypes.STRING,
    first_phone_type: DataTypes.STRING,
    last_phone_type: DataTypes.STRING,
    last_login_at: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    is_notification: DataTypes.BOOLEAN,
    is_location: DataTypes.BOOLEAN,
    country_code: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    address_line1: DataTypes.TEXT,
    address_line2: DataTypes.TEXT,
    firebase_token: DataTypes.TEXT,
    rewards_points: DataTypes.DOUBLE,
    wallet_balance: DataTypes.DOUBLE,
    referal_code: DataTypes.STRING,
    birth_date: DataTypes.DATE,
    annivarsery_date: DataTypes.DATE,
    _deleted: DataTypes.BOOLEAN,
  },{
    indexes: [
      {
          unique: true,
          fields: ['email', 'phone']
      }
    ]
  });

  users.associate = function(models) {
    users.hasOne(models.notifications, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    users.hasOne(models.user_cards, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    users.hasOne(models.card_inventorys, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    users.hasOne(models.user_transactions, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    users.hasOne(models.user_wallet_transactions, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  };
  return users;
};