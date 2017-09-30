/* eslint-disable */

'use strict';
module.exports = function(sequelize, DataTypes) {
  var ScheduleSet = sequelize.define('scheduleSet', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
  });

  return ScheduleSet;
};