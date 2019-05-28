'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('participants', {
            id: {
                primaryKey: true,
                autoIncrement: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            type: {
                type: Sequelize.CHAR,
                allowNull: false
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('participants');
    }
};
