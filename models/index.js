/* eslint-disabled */

'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
var dotenv = require("dotenv");
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const db = {};

dotenv.config();
const databaseName = process.env.DATABASE_NAME;
const databaseUser = process.env.DATABASE_USER;
const databasePass = process.env.DATABASE_PASS;

let sequelize;

//production
sequelize = new Sequelize(databaseName, databaseUser, databasePass, {
  host: 'localhost',
  dialect: 'mysql',
});

//development
// sequelize = new Sequelize('income_shows', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql',
// });

const op = Sequelize.Op;
const operatorsAliases = {
    $in: op.in,
    $or: op.or
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
// db['op'] = op;

module.exports = db;
