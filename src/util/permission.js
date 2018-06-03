'use strict';
import {User} from './../db/models/user';
import {Role} from './../db/models/role';

/**
 * Validate whether requested permissions are present for the given user
 * @param  {String} userId
 * @param  {Object} permission
 * @return {Promise} promise
 */
const hasPermission = (userId, permission) => {
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
                resolve(
                    JSON.parse(
                        result.role.permission
                    )[permission.realm].includes(permission.action)
                );
            }
        }).catch((error) => {
            reject(error);
        });
    });
};

export default {hasPermission};
