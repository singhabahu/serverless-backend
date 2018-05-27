'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';

export const Organization = sequelize.define('organization', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: Sequelize.STRING,
    },
    phone: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
    ownerId: {
        type: Sequelize.STRING,
    },
    awsAccountStatus: {
        type: Sequelize.STRING,
    },
    awsClientId: {
        type: Sequelize.STRING,
    },
    awsSecretKey: {
        type: Sequelize.STRING,
    },
    awsAccountKey: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
    },
    updatedAt: {
        type: Sequelize.DATE,
    },
}, {
        tableName: 'organization',
    });
