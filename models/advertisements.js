'use strict';
module.exports = (sequelize, DataTypes) => {
  const advertisements = sequelize.define('advertisements', {
    name: DataTypes.STRING,
    file_name: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{});

  return advertisements;
};