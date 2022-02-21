'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_transactions = sequelize.define('user_transactions', {
    user_id: DataTypes.STRING,
    card_id: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    card_quantity: DataTypes.INTEGER,
    type: DataTypes.STRING, //DEBIt OR CREDIT
    is_pass_used: DataTypes.BOOLEAN,
    reference_id: DataTypes.STRING,
    payment_gateway_order_id: DataTypes.STRING,
    response_string: DataTypes.TEXT,
    order_code: DataTypes.STRING,
    transaction_at : DataTypes.DATE,
    payment_mode: DataTypes.STRING, //FATOORAH OR KNET
    status: DataTypes.STRING,
    _deleted: DataTypes.BOOLEAN,
  },{});
  user_transactions.associate = function(models) {
    user_transactions.belongsTo(models.users, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    user_transactions.belongsTo(models.cards, {
      foreignKey: 'card_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    user_transactions.hasOne(models.user_wallet_transactions, {
      foreignKey: 'transaction_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    user_transactions.hasMany(models.card_inventorys, {
      foreignKey: 'transaction_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  };
  return user_transactions;
};