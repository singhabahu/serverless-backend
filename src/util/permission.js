'use strict';
import {User} from './../db/models/user';
import {Role} from './../db/models/role';
import {UserProjects} from './../db/models/project';
/**
 * Permission class
 */
class Permission {
  /**
   * Validate whether requested permissions are present for the given user
   * @param  {String} userId
   * @param  {Object} permission
   * @return {Promise} promise
   */
  static hasPermission(userId, permission) {
    return new Promise((resolve, reject) => {
      User.find({
        attributes: ['uuid'],
        where: {
          uuid: userId,
        },
        include: [{
          model: Role,
          required: true,
          attributes: ['type', 'permission'],
        }],
      }).then((result) => {
        if (result == null) {
          reject('Cannot find role for the given id');
        } else {
          let actions;
          try {
            actions = JSON.parse(
              result.role.permission
            )[permission.realm];
          } catch (error) {
            return resolve(false);
          }
          resolve(
            actions.includes(permission.action) ||
            actions.includes('admin')
          );
        }
      }).catch((error) => {
        reject(error);
      });
    });
  };

  /**
  * Validate whether requested permissions are present for the given user
  * for the given project
  * @param  {Object} details
  * @param  {Object} permission
  * @return {Promise} promise
  */
  static hasProjectPermission(details, permission) {
    return new Promise((resolve, reject) => {
      UserProjects.find({
        attributes: ['permission'],
        where: {
          userId: details.uuid,
          projectId: details.projectId,
        },
      }).then((result) => {
        if (result == null) {
          reject('Cannot find permission for the given project');
        } else {
          let actions;
          try {
            actions = JSON.parse(
              result.permission
            )[permission.realm];
          } catch (error) {
            return resolve(false);
          }
          resolve(
            actions.includes(permission.action) ||
            actions.includes('admin')
          );
        }
      }).catch((error) => {
        reject(error);
      });
    });
  };
}

export default Permission;
