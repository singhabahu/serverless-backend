'use strict';
import {sequelize} from './../mysql-connector';
import * as Sequelize from 'sequelize';
import {User} from './user';

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

Project.belongsToMany(User, {through: 'users_projects'});
User.belongsToMany(Project, {through: 'users_projects', foreignKey: 'userId'});
