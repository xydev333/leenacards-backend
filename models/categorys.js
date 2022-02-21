'use strict';

module.exports = (sequelize, DataTypes) => {
  const categorys = sequelize.define('categorys', {
    name: DataTypes.STRING,
    arabic_name: DataTypes.STRING,
    sort_order : DataTypes.INTEGER,
    description: DataTypes.STRING,
    color: DataTypes.STRING,
    icon: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{});

  categorys.associate = function(models) {
    categorys.hasOne(models.types, {
      foreignKey: 'category_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
    categorys.hasOne(models.cards, {
      foreignKey: 'category_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  };

  return categorys;
};