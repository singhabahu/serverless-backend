'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';

export const Organization = sequelize.define('organizations', {
    id: {
        type: Sequelize.BIGINT,
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
    owner_id: {
        type: Sequelize.STRING,
    },
    aws_account_status: {
        type: Sequelize.STRING,
    },
    aws_client_id: {
        type: Sequelize.STRING,
    },
    aws_secret_key: {
        type: Sequelize.STRING,
    },
    aws_account_key: {
        type: Sequelize.STRING,
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
    },
    updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
    },
  });
