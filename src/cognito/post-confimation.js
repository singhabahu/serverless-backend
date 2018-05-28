'use strict';
import {CognitoIdentityServiceProvider} from 'aws-sdk';
import {Organization} from './../db/models/organization';
import {User} from './../db/models/user';

const cognito = new CognitoIdentityServiceProvider();
const getAttributeValue = (collection, field) => {
    const result = collection.UserAttributes.find(
        (element) => element.Name == field
    );
    if (result) return result.Value;
    else return null;
};

/**
 * Handles the post confirmation actions
 * @param {*} event
 * @param {*} context
 */
export const handler = (event, context) => {
    let params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: event.request.userAttributes.email,
    };

    cognito.adminGetUser(params, (err, user) => {
        if (err) return context.done(err);
        if (getAttributeValue(user, 'custom:manualConfirmation') == null) {
            cognito.adminDisableUser(params, (err, result) => {
                if (err) return context.done(err);
                params.UserAttributes = [{
                    // TODO change attribute to more meaningful name
                    Name: 'custom:manualConfirmation',
                    Value: 'confirmed',
                }];
                cognito.adminUpdateUserAttributes(
                    params,
                    (err, confirmation) => {
                        if (err) return context.done(err);
                        Organization.create({
                            name: getAttributeValue(
                                user, 'custom:organizationName'
                            ),
                            phone: getAttributeValue(
                                user, 'custom:organizationPhone'
                            ),
                            email: getAttributeValue(
                                user, 'custom:organizationEmail'
                            ),
                            awsAccountStatus: getAttributeValue(
                                user, 'custom:awsAccountStatus'
                            ),
                            awsClientId: getAttributeValue(
                                user, 'custom:awsClientId'
                            ),
                            awsSecretKey: getAttributeValue(
                                user, 'custom:awsSecretKey'
                            ),
                            awsAccountKey: getAttributeValue(
                                user, 'custom:awsAccountKey'
                            ),
                        }).then((result) => {
                            User.create({
                                uuid: getAttributeValue(user, 'sub'),
                                name: getAttributeValue(
                                    user, 'custom:authPersonName'
                                ),
                                email: getAttributeValue(user, 'email'),
                                organizationId: result.id,
                                // super_admin as the role of the creator
                                roleId: 1,
                            }).then((result) => {
                                return context.done(null, result);
                            }).catch((error) => {
                                return context.done(error);
                            });
                        }).catch((error) => {
                            return context.done(error);
                        });
                    });
            });
        }
    });
};
