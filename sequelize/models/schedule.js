/* eslint-disable */

'use strict';
module.exports = function(sequelize, DataTypes) {
  var Schedule = sequelize.define('schedule', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    scheduleSetId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    day: DataTypes.ENUM('MON','TUE','WED','THU','FRI','SAT','SUN'),
    start: {
      type: DataTypes.INTEGER,
      validate: (value) => value % 15 === 0,
    },
    end: {
      type: DataTypes.INTEGER,
      validate: (value) => value % 15 === 0,
    }
  });

  return Schedule;
};