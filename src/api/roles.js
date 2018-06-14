'use strict';
import {Role} from '../db/models/role';
import Permission from '../util/permission';
import {done} from '../helpers/response-handler';

/**
 * Get all the roles.
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const list = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'role', action: 'view'})
    .then((confirmation) => {
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
      };

      Role.findAll().then((roles) => {
        roles = roles.map((role) => {
          role.permission = JSON.parse(role.permission);
          return role;
        });

        return callback(null, done({
          statusCode: 200,
          data: roles,
        }));
      }).catch((error) => {
        return callback(null, done({
          statusCode: 500,
          message: error,
        }));
      });
    }).catch((error) => {
      return callback(null, done({
        statusCode: 500,
        message: error,
      }));
    });
};
