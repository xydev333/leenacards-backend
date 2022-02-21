'use strict';

module.exports = (sequelize, DataTypes) => {
  const types = sequelize.define('types', {
    category_id: DataTypes.STRING,
    sort_order: DataTypes.INTEGER,
    name: DataTypes.STRING,
    arabic_name: DataTypes.STRING,
    color: DataTypes.STRING,
    image: DataTypes.STRING,
    icon: DataTypes.STRING,
    country_id: DataTypes.STRING,
    description: DataTypes.STRING,
    available_count: DataTypes.INTEGER,
    sold_count: DataTypes.INTEGER,
    is_active: DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{});

  types.associate = function(models) {
    types.belongsTo(models.categorys, {
      foreignKey: 'category_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    types.belongsTo(models.countrys, {
      foreignKey: 'country_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    types.hasOne(models.cards, {
      foreignKey: 'type_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  };

  return types;
};