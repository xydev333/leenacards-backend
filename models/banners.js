'use strict';
module.exports = (sequelize, DataTypes) => {
  const banners = sequelize.define('banners', {
    image: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    card_id: DataTypes.STRING,
  },{});

  banners.associate = function(models) {
    banners.belongsTo(models.cards, {
      foreignKey: 'card_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  }
  
  return banners;
};