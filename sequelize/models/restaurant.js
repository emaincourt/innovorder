/* eslint-disable */

'use strict';
module.exports = function(sequelize, DataTypes) {
  var Restaurant = sequelize.define('restaurant', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: DataTypes.STRING,
    preparationDelay: DataTypes.INTEGER,
    rushDelay: DataTypes.INTEGER,
    scheduleSetId: DataTypes.UUID,
  });

  return Restaurant;
};