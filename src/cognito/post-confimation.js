'use strict';
import {DynamoDB} from 'aws-sdk';
import {CognitoIdentityServiceProvider} from 'aws-sdk';

import * as crypto from 'crypto';

const cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
const dynamoDB = new DynamoDB.DocumentClient();

/**
 * Handles the post confirmation actions
 * @param {*} event
 * @param {*} context
 */
export const handler = (event, context) => {
    const params = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: event.request.userAttributes.email,
    };

    event.request.userAttributes.uuid = crypto.randomBytes(16).toString('hex');

    dynamoDB.put({
        TableName: process.env.ORGANIZATIONS_TABLE,
        Item: event.request.userAttributes,
      }, (err) => {
        if (err) console.log(err);
        cognitoidentityserviceprovider.adminDisableUser(params, (err, data) => {
            if (err) context.done(null, event);
            else context.done(null, event);
        });
      });
};
