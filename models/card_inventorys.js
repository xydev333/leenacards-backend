'use strict';
module.exports = (sequelize, DataTypes) => {
  const card_inventorys = sequelize.define('card_inventorys', {
    user_id: DataTypes.STRING,
    card_id: DataTypes.STRING,
    transaction_id: DataTypes.STRING,
    reserved_on : DataTypes.DATE,
    is_paid : DataTypes.BOOLEAN,
    transaction_type: DataTypes.STRING,
    redeem_code : DataTypes.TEXT,
    is_active: DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{});
  card_inventorys.associate = function(models) {
    card_inventorys.belongsTo(models.users, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    card_inventorys.belongsTo(models.cards, {
        foreignKey: 'card_id',
        onDelete: 'CASCASDE',
        onUpdate: 'CASECADE'
    });
    card_inventorys.belongsTo(models.user_transactions, {
      foreignKey: 'transaction_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    card_inventorys.belongsTo(models.user_wallet_transactions, {
      foreignKey: 'transaction_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  };
  return card_inventorys;
};