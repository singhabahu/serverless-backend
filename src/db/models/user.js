'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';

export const User = sequelize.define('users', {
    uuid: {
        type: Sequelize.BIGINT,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING,
    },
    organization_id: {
        type: Sequelize.BIGINT,
    },
    role_id: {
        type: Sequelize.BIGINT,
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
