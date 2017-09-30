/* eslint-disable */

'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('schedules', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      day: {
        allowNull: false,
        type: Sequelize.ENUM('MON','TUE','WED','THU','FRI','SAT','SUN'),
      },
      start: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: (value) => value % 15 === 0,
      },
      end: {
        allowNull: false,
        type: Sequelize.INTEGER,
        validate: (value) => value % 15 === 0,
      },
      scheduleSetId: {
        type: Sequelize.UUID,
        references: {
            model: "scheduleSets",
            key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('schedules');
  }
};