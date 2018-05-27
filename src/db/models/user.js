'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';

export const User = sequelize.define('user', {
    uuid: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
    organizationId: {
        type: Sequelize.INTEGER,
    },
    roleId: {
        type: Sequelize.INTEGER,
    },
    createdAt: {
        type: Sequelize.DATE,
    },
    updatedAt: {
        type: Sequelize.DATE,
    },
}, {
        tableName: 'user',
    });
