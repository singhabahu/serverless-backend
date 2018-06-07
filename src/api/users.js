'use strict';
import * as Sequelize from 'sequelize';
import {CognitoIdentityServiceProvider} from 'aws-sdk';

import {User} from '../db/models/user';
import {Role} from '../db/models/role';
import {done} from '../helpers/response-handler';
import {Organization} from '../db/models/organization';
import Permission from '../util/permission';

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
          return callback(null, done(null, {
            statusCode: 200,
            data: result,
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
    }).catch((error) => {
      return callback(null, done({
        statusCode: 500,
        message: error,
      }));
    });
};

/**
 * Create user under organization using cognito admin API.
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @return {function} done
 */
export const create = (event, context, callback) => {
  const cognito = new CognitoIdentityServiceProvider();

  const name = JSON.parse(event.body).name;
  const email = JSON.parse(event.body).email;
  const roleId = JSON.parse(event.body).roleId;

  if (
    name == null || name.trim() == '' ||
    email == null || email.trim() == '' ||
    roleId == null || roleId == ''
  ) {
    return callback(null, done({
      statusCode: 400,
      message: `Request doesn't contain a valid object`,
    }));
  }

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'user', action: 'create'})
    .then((confirmation) => {
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
      };

      const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: email,
        DesiredDeliveryMediums: [
          'EMAIL',
        ],
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'custom:manualConfirmation',
            Value: 'confirmed',
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      };
      cognito.adminCreateUser(params, (error, data) => {
        if (error) {
          return callback(null, done({
            statusCode: 400,
            message: error,
          }));
        } else {
          User.find({
            attributes: ['uuid', 'organizationId'],
            where: {
              uuid: uuid,
            },
          }).then((user) => {
            User.create({
              uuid: data.User.Attributes
                .find((element) => element.Name === 'sub').Value,
              name: name,
              email: email,
              organizationId: user.organizationId,
              roleId: roleId,
            }).then((result) => {
              return callback(null, done(null, {
                statusCode: 200,
                data: result,
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
        }
      });
    }).catch((error) => {
      return callback(null, done({
        statusCode: 500,
        message: error,
      }));
    });
};

/**
 * Get details of specific user in the same organization
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @return {function} done
 */
export const get = (event, context, callback) => {
  const uuid = event.requestContext.authorizer.principalId;
  const sub = event.pathParameters.uuid;
  if (sub == null || sub.trim() == '') {
    return callback(null, done({
      statusCode: 400,
      message: `Request doesn't contain a valid object`,
    }));
  }

  Permission.hasPermission(uuid, {realm: 'user', action: 'view'})
    .then((confirmation) => {
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
      };

      User.find({
        where: {
          uuid: uuid,
        },
        attributes: ['organizationId'],
      }).then((requester) => {
        User.find({
          where: {
            uuid: sub,
            organizationId: requester.organizationId,
          },
          attributes: {
            exclude: ['organizationId', 'roleId'],
          },
          include: [
            {
              model: Role,
              required: true,
            },
            {
              model: Organization,
              required: true,
            },
          ],
        }).then((user) => {
          if (user == null) {
            return callback(null, done({
              statusCode: 404,
              message: `Cannot find user with the given user id`,
            }));
          }
          user.role.permission = JSON.parse(user.role.permission);
          return callback(null, done({
            statusCode: 200,
            data: user,
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
    }).catch((error) => {
      return callback(null, done({
        statusCode: 500,
        message: error,
      }));
    });
};
