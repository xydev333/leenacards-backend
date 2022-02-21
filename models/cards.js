'use strict';
module.exports = (sequelize, DataTypes) => {
  const cards = sequelize.define('cards', {
    type_id: DataTypes.STRING,
    type_varient_id: DataTypes.STRING,
    category_id: DataTypes.STRING,
    name: DataTypes.STRING,
    sku: DataTypes.STRING,
    color: DataTypes.STRING,
    icon: DataTypes.TEXT,
    redeem_code: DataTypes.TEXT,
    amount: DataTypes.FLOAT,
    country_amount : DataTypes.TEXT,
    available_count: DataTypes.INTEGER,
    sold_count: DataTypes.INTEGER,
    discount_amount: DataTypes.FLOAT,
    validity: DataTypes.INTEGER,
    is_feature : DataTypes.BOOLEAN,
    image: DataTypes.STRING,
    arabic_description: DataTypes.STRING,
    description: DataTypes.STRING,
    terms_and_condition: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    is_active: DataTypes.BOOLEAN,
    is_paid: DataTypes.BOOLEAN,
    is_buy: DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{});

  cards.associate = function(models) {
    cards.belongsTo(models.types, {
      foreignKey: 'type_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    cards.belongsTo(models.categorys, {
        foreignKey: 'category_id',
        onDelete: 'CASCASDE',
        onUpdate: 'CASECADE'
    });
    cards.hasOne(models.card_inventorys, {
      foreignKey: 'card_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    cards.hasOne(models.user_cards, {
      foreignKey: 'card_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    cards.hasOne(models.user_transactions, {
      foreignKey: 'card_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    cards.hasOne(models.user_wallet_transactions, {
      foreignKey: 'card_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    cards.hasOne(models.banners, {
      foreignKey: 'card_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    })
  };

  return cards;
};