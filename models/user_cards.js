'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_cards = sequelize.define('user_cards', {
    name: DataTypes.STRING,
    user_id: DataTypes.STRING,
    card_id: DataTypes.STRING,
    transaction_id : DataTypes.STRING,
    transaction_type : DataTypes.STRING,
    type_varient_id: DataTypes.STRING,
    redeem_code: DataTypes.STRING,
    amount: DataTypes.DOUBLE,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    user_card_start_date: DataTypes.DATE,
    user_card_end_date: DataTypes.DATE,
    validity: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
    is_paid: DataTypes.BOOLEAN,
    purchase_date: DataTypes.DATE,
    _deleted: DataTypes.BOOLEAN,
  },{});
  user_cards.associate = function(models) {
    user_cards.belongsTo(models.users, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    user_cards.belongsTo(models.cards, {
        foreignKey: 'card_id',
        onDelete: 'CASCASDE',
        onUpdate: 'CASECADE'
      });
  };
  return user_cards;
};