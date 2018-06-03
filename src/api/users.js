'use strict';
import {User} from './../db/models/user';
import * as Sequelize from 'sequelize';
import Permission from '../util/permission';
import {done} from '../helpers/response-handler';

/**
 * Get all users related to the same organization
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 */
export const all = (event, context, callback) => {
  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'user', action: 'view'})
    .then((confirmation) => {
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
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
          return callback(null, done(null, result));
        }).catch((error) => {
          error.statusCode = 403;
          return callback(null, done(error));
        });
      }).catch((error) => {
        error.statusCode = 403;
        return callback(null, done(error));
      });
    }).catch((error) => {
      error.statusCode = 403;
      return callback(null, done(error));
    });
};
