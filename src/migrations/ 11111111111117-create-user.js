'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('users', {
            id: {
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            referral: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            reg_time: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
                allowNull: false
            },
            activity: {
                type: Sequelize.ENUM('new', 'active', 'inactive', 'ban'),
                allowNull: false
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('users');
    }
};
