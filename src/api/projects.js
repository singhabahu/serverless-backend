'use strict';
import {User} from '../db/models/user';
import {Project} from '../db/models/project';
import Permission from '../util/permission';
import {done} from '../helpers/response-handler';

/**
 * Create project under user's organization
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 * @return {function} done
 */
export const create = (event, context, callback) => {
  const name = JSON.parse(event.body).name;
  if (name == null || name.trim() == '') {
    return callback(null, done({
      statusCode: 400,
      message: `Request doesn't contain a valid object`,
    }));
  }

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'project', action: 'create'})
    .then((confirmation) => {
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
      };

      User.find({
        attributes: ['uuid', 'organizationId'],
        where: {
          uuid: uuid,
        },
      }).then((user) => {
        Project.create({
          name: name,
          ownerId: uuid,
          organizationId: user.organizationId,
        }).then((project) => {
          user.addProject(project).then((result) => {
            return callback(null, done(null, {
              statusCode: 200,
              data: result[0][0]}
            ));
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
    }).catch((error) => {
      return callback(null, done({
        statusCode: 500,
        message: error,
      }));
    });
};

export const addUser = (event, context, callback) => {
  const userId = JSON.parse(event.body).userId;
  const projectId = JSON.parse(event.body).projectId;

  if (
    userId == null || userId.trim() == '' ||
    projectId == null || isNaN(projectId)
  ) {
    return callback(null, done({
      statusCode: 400,
      message: `Request doesn't contain a valid object`,
    }));
  }

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'project', action: 'insert'})
    .then((confirmation) => {
      // 1. Check for permission
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
      };

       User.find({
        attributes: ['uuid', 'organizationId'],
        where: {
          uuid: userId,
        },
      }).then((user) => {
        Project.find({
          where: {
            id: projectId,
          },
        }).then((project) => {
            if (project.organizationId == user.organizationId) {
              project.addUser(user).then((result) => {
                if (result.length == 0) {
                  return callback(null, done({
                    statusCode: 400,
                    message: `User has already added to this project`,
                  }));
                } else {
                  return callback(null, done(null, {
                    statusCode: 200,
                    data: result[0][0],
                  }));
                }
              }).catch((error) => {
                return callback(null, done({
                  statusCode: 500,
                  message: error,
                }));
              });
            } else {
              return callback(null, done({
                statusCode: 400,
                message: `User and project doesn't belong to same organization`,
              }));
            }
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

