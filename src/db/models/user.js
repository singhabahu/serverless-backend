'use strict';
import * as Sequelize from 'sequelize';

import {Role} from './role';
import {Organization} from './organization';
import {sequelize} from './../mysql-connector';

export const User = sequelize.define('users', {
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
        tableName: 'users',
    });

User.belongsTo(Role);
User.belongsTo(Organization);