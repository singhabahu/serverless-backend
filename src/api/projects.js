'use strict';
import {User} from '../db/models/user';
import {Project, UserProjects} from '../db/models/project';
import Permission from '../util/permission';
import {done} from '../helpers/response-handler';

/**
 * Get all projects related to the user
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 */
export const list = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'project', action: 'view'})
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
      }).then((user) => {
        user.getProjects().then((projects) => {
          const response = [];
          projects.forEach((project) => {
            const transform = {
              id: project.id,
              name: project.name,
              permission: JSON.parse(project.users_projects.permission),
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              assignedAt: project.users_projects.createdAt,
            };
            response.push(transform);
          });
          return callback(null, done({
            statusCode: 200,
            data: response,
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
    });
};

/**
 * Create project under user's organization
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 * @return {function} done
 */
export const create = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
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
          user.addProject(project, {
            through: {
              permission: `{"specific":["admin"]}`,
            },
          }).then((result) => {
            result[0][0].permission = JSON.parse(result[0][0].permission);
            return callback(null, done(null, {
              statusCode: 200,
              data: result[0][0],
            }
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

/**
 * Insert user to a given project
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @return {function} done
 */
export const insert = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
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
  Permission.hasProjectPermission({
    uuid: uuid,
    projectId: projectId,
  }, {realm: 'specific', action: 'insert'})
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
          uuid: userId,
        },
      }).then((user) => {
        Project.find({
          where: {
            id: projectId,
            organizationId: user.organizationId,
          },
        }).then((project) => {
          if (project != null) {
            project.addUser(user).then((result) => {
              if (result.length == 0) {
                return callback(null, done({
                  statusCode: 400,
                  message: `User has been already added to this project`,
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
              message: `Project not found`,
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

/**
 * Remove the project and user associations for that project
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 * @return {function} done
 */
export const remove = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const projectId = event.pathParameters.id;

  if (projectId == null || isNaN(projectId)) {
    return callback(null, done({
      statusCode: 400,
      message: `Request doesn't contain a valid object`,
    }));
  }

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasProjectPermission({
    uuid: uuid,
    projectId: projectId,
  }, {realm: 'specific', action: 'delete'})
    .then((confirmation) => {
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
      };
      Project.destroy({
        where: {
          id: projectId,
          ownerId: uuid,
        },
      }).then((projectResult) => {
        if (projectResult > 0) {
          UserProjects.destroy({
            where: {
              projectId: projectId,
            },
          }).then((userProjectResult) => {
            if (userProjectResult > 0) {
              return callback(null, done(null, {
                statusCode: 200,
                data: userProjectResult,
              }));
            } else {
              return callback(null, done({
                statusCode: 500,
                message: `Internal server errror`,
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
            message: `Project not found`,
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
};

/**
 * Update project details of a given project
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 * @return {function} done
 */
export const update = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const name = JSON.parse(event.body).name;
  const projectId = event.pathParameters.id;
  if (
    name == null || name.trim() === '' ||
    projectId == null || isNaN(projectId)
  ) {
    return callback(null, done({
      statusCode: 400,
      message: `Request doesn't contain a valid object`,
    }));
  }

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasProjectPermission({
    uuid: uuid,
    projectId: projectId,
  }, {realm: 'specific', action: 'update'})
    .then((confirmation) => {
      if (!confirmation) {
        return callback(null, done({
          statusCode: 403,
          message: `User doesn't have enough permission to perform this action`,
        }));
      };

      Project.update(
        {
          name: name,
        }, {
          where: {
            id: projectId,
          },
        }).then((result) => {
          return callback(null, done(null, {
            statusCode: 200,
            data: {id: projectId, name: name},
          }));
        }).catch((error) => {
          return callback(null, done({
            statusCode: 500,
            message: error,
          }));
        });
    }).catch((error) => {
      return callback(null, done({
        statusCode: 404,
        message: error,
      }));
    });
};

/**
 * Get specific project related to the user
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 * @return {function} done
 */
export const get = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const projectId = event.pathParameters.id;
  if (projectId == null || isNaN(projectId)) {
    return callback(null, done({
      statusCode: 400,
      message: `Request doesn't contain a valid object`,
    }));
  }

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'project', action: 'view'})
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
      }).then((user) => {
        user.getProjects({where: {id: projectId}}).then((projects) => {
          if (projects.length === 0) {
            return callback(null, done({
              statusCode: 404,
              message: `Cannot find the project specified`,
            }));
          }
          const project = projects.pop();
          project.getUsers({
            attributes: ['uuid', 'email', 'name'],
          }).then((users) => {
            const response = {
              id: project.id,
              name: project.name,
              permission: JSON.parse(project.users_projects.permission),
              users: users.map((user) => {
                user = JSON.parse(JSON.stringify(user));
                user.permission = JSON.parse(user.users_projects.permission);
                delete user.users_projects;
                return user;
              }),
              createdAt: project.createdAt,
              updatedAt: project.updatedAt,
              assignedAt: project.users_projects.createdAt,
            };
            return callback(null, done({
              statusCode: 200,
              data: response,
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
    });
};
