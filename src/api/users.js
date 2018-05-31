'use strict';
import {User} from './../db/models/user';
import * as Sequelize from 'sequelize';
import Permission from '../util/permission';

/**
 * Get all users related to the same organization
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 */
export const all = (event, context, callback) => {
  const done = (error, res) => callback(null, {
    statusCode: error ? '403' : '200',
    body: error ? JSON.stringify(error) : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'user', action: 'view'})
    .then((confirmation) => {
      if (!confirmation) {
        return done({
          message: `User doesn't have enough permission to perform this action`,
        });
      };

      User.find({
        attributes: ['organizationId'],
        where: {
          uuid: uuid,
        },
      }).then((user) => {
        User.findAll({
          where: {
            organizationId: user.organizationId,
            uuid: {[Sequelize.Op.ne]: uuid},
          },
        }).then((result) => {
          result = {data: result};
          return done(null, result);
        }).catch((error) => {
          return done(error);
        });
      }).catch((error) => {
        return done(error);
      });
    }).catch((error) => {
      return done(error);
    });
};
