'use strict';
import {User} from '../db/models/user';
import {Project} from '../db/models/project';
import Permission from '../util/permission';

/**
 * Create project under user's organization
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 * @return {function} done
 */
export const create = (event, context, callback) => {
  const done = (error, res) => callback(null, {
    statusCode: error ? '403' : '201',
    body: error ? JSON.stringify(error) : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  const name = JSON.parse(event.body).name;
  if (name == null || name.trim() == '') {
    return done({
      message: `Request doesn't contain a valid object`,
    });
  }

  const uuid = event.requestContext.authorizer.principalId;
  Permission.hasPermission(uuid, {realm: 'project', action: 'create'})
    .then((confirmation) => {
      if (!confirmation) {
        return done({
          message: `User doesn't have enough permission to perform this action`,
        });
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
            return done(null, {data: result[0][0]});
          }).catch((error) => {
            return done(error);
          });
        }).catch((error) => {
          return done(error);
        });
      }).catch((error) => {
        return done(error);
      });
    });
};
