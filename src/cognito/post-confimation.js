'use strict';
import {CognitoIdentityServiceProvider} from 'aws-sdk';
import {Organization} from './../db/models/organization';
import {User} from './../db/models/user';

const cognito = new CognitoIdentityServiceProvider();

/**
 * Extracts attribute value from a given collection
 * @param  {Array} collection
 * @param  {String} field
 * @return {String} value
 */
const getAttributeValue = (collection, field) => {
    const result = collection.UserAttributes.find(
        (element) => element.Name == field
    );
    if (result) return result.Value;
    else return null;
};

/**
 * Creates a new organization record in the database
 * @param  {Object} collection
 * @return {*} organization
 */
const createOrganization = async (collection) => {
    return await Organization.create({
        name: getAttributeValue(
            collection, 'custom:organizationName'
        ),
        phone: getAttributeValue(
            collection, 'custom:organizationPhone'
        ),
        email: getAttributeValue(
            collection, 'custom:organizationEmail'
        ),
        awsAccountStatus: getAttributeValue(
            collection, 'custom:awsAccountStatus'
        ),
        awsClientId: getAttributeValue(
            collection, 'custom:awsClientId'
        ),
        awsSecretKey: getAttributeValue(
            collection, 'custom:awsSecretKey'
        ),
        awsAccountKey: getAttributeValue(
            collection, 'custom:awsAccountKey'
        ),
    });
};

/**
 * Creates a new user record in the database
 * @param  {Object} collection
 * @return {Promise} user
 */
const createUser = async (collection) => {
    return await User.create({
        uuid: getAttributeValue(collection, 'sub'),
        name: getAttributeValue(
            collection, 'custom:authPersonName'
        ),
        email: getAttributeValue(collection, 'email'),
        organizationId: collection.id,
        // super_admin as the role of the creator
        roleId: 1,
    });
};

/**
 * Handles the post confirmation actions
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const handler = (event, context, callback) => {
    let params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: event.request.userAttributes.email,
    };

    cognito.adminGetUser(params, (error, user) => {
        if (error) return callback(error);
        if (getAttributeValue(user, 'custom:manualConfirmation') == null) {
            cognito.adminDisableUser(params, (error, result) => {
                if (error) return callback(error);
                params.UserAttributes = [{
                    // TODO change attribute to more meaningful name
                    Name: 'custom:manualConfirmation',
                    Value: 'confirmed',
                }];
                cognito.adminUpdateUserAttributes(
                    params,
                    (error, confirmation) => {
                        if (error) return callback(error);
                        createOrganization(user).then((result) => {
                            user.id = result.id;
                            createUser(user).then((result) => {
                                return callback(null, result);
                            }).catch((error) => {
                                return callback(error);
                            });
                        }).catch((error) => {
                            return callback(error);
                        });
                    });
            });
        }
    });
};
