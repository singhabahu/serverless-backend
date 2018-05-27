'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';

export const Role = sequelize.define('role', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    type: {
        type: Sequelize.STRING,
    },
    permissions: {
        type: Sequelize.JSON,
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
