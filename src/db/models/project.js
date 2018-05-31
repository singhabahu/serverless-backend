'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';

export const Project = sequelize.define('projects', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
    },
    ownerId: {
        type: Sequelize.STRING,
    },
    organizationId: {
        type: Sequelize.INTEGER,
    },
    createdAt: {
        type: Sequelize.DATE,
    },
    updatedAt: {
        type: Sequelize.DATE,
    },
}, {
        tableName: 'projects',
    });
