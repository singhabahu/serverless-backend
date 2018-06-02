'use strict';
import {User} from './../db/models/user';
import * as Sequelize from 'sequelize';
import Permission from '../util/permission';
import {CognitoIdentityServiceProvider} from 'aws-sdk';

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

/**
 * Create user under organization
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @return {function} done
 */
export const create = (event, context, callback) => {
  const cognito = new CognitoIdentityServiceProvider();

  const done = (error, res) => callback(null, {
    statusCode: error ? '403' : '201',
    body: error ? JSON.stringify(error) : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  const name = JSON.parse(event.body).name;
  const email = JSON.parse(event.body).email;
  const roleId = JSON.parse(event.body).roleId;

  // TODO: email validation if needed.
  if (name == null || name.trim() == ''
    || email == null || email.trim() == '' || roleId == null || roleId == '') {
    return done({
      message: `Request doesn't contain a valid object`,
    }, null);
  }

  const uuid = event.requestContext.authorizer.principalId;

  // Check user permission to create another user.
  Permission.hasPermission(uuid, {realm: 'user', action: 'create'})
    .then((confirmation) => {
      if (!confirmation) {
        return done({
          message: `User doesn't have enough permission to perform this action`,
        }, null);
      };

      // If user has permission.

      // 1.Create the cognito user.
      const params = {
        UserPoolId: process.env.USER_POOL_ID, /* required */
        Username: email, /* required */
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
        ],
      };

      cognito.adminCreateUser(params, (error, data) => {
        if (error) {
          return done(error, null);
        } else {
          // 2.Query the user table to get the owner's organization id.
          User.find({
            attributes: ['uuid', 'organizationId'],
            where: {
              uuid: uuid,
            },
          }).then((user) => {
            // 3.Enter all new user's values to the user table.
            User.create({
              uuid: data.User.Attributes
                .find((element) => element.Name === 'sub').Value,
              name: name,
              email: email,
              organizationId: user.organizationId,
              roleId: roleId,
            }).then((newUser) => {
              return done(null, {data: newUser});
            }).catch((error) => {
              return done(error, null);
            });
          }).catch((error) => {
            return done(error, null);
          });
        }
      });
    }).catch((error) => {
      return done(error, null);
    });
};
