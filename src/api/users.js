'use strict';
import {User} from './../db/models/user';
import * as Sequelize from 'sequelize';
import Permission from '../util/permission';
import {CognitoIdentityServiceProvider} from 'aws-sdk';
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
      console.log(error);
      return callback(null, done({
        statusCode: 500,
        message: error,
      }));
    });
};
