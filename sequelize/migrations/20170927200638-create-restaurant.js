/* eslint-disable */

'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('restaurants', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.STRING,
      },
      preparationDelay: {
        type: Sequelize.INTEGER,
        validate: (value) => value % 15 === 0,
      },
      rushDelay: {
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
    return queryInterface.dropTable('restaurants');
  }
};