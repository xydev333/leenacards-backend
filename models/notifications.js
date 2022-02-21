'use strict';
module.exports = (sequelize, DataTypes) => {
  const notifications = sequelize.define('notifications', {
    user_id: DataTypes.STRING,
    notification_type: DataTypes.STRING,
    channels: DataTypes.STRING,
    title: DataTypes.STRING,
    message: DataTypes.STRING,
    payload: DataTypes.STRING,
    _created_by: DataTypes.STRING,
    email_template: DataTypes.STRING,
    sender_info: DataTypes.STRING,
    notification_ref_id: DataTypes.STRING,
    is_read: DataTypes.BOOLEAN,
    _deleted: DataTypes.BOOLEAN,
  },{});
  notifications.associate = function(models) {
    notifications.belongsTo(models.users, {
      foreignKey: 'user_id',
      onDelete: 'CASCASDE',
      onUpdate: 'CASECADE'
    });
  };
  return notifications;
};