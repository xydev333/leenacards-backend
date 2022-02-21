'use strict';

module.exports = (sequelize, DataTypes) => {
  const countrys = sequelize.define('countrys', {
    name: DataTypes.STRING,
    code: DataTypes.STRING,
    isd_code: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    is_gcc : DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{});

  countrys.associate = function(models) {
    countrys.hasOne(models.types, {
      foreignKey: 'country_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  };

  return countrys;
};