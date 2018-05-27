'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';

export const Role = sequelize.define('role', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: Sequelize.STRING,
    },
    permission: {
        type: Sequelize.JSON,
    },
    createdAt: {
        type: Sequelize.DATE,
    },
    updatedAt: {
        type: Sequelize.DATE,
    },
}, {
        tableName: 'role',
    });
