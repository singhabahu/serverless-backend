import {DynamoDB} from 'aws-sdk';
import {CognitoIdentityServiceProvider} from 'aws-sdk';

'use strict';
import * as crypto from 'crypto';

let cognitoidentityserviceprovider = new CognitoIdentityServiceProvider();
let dynamoDB = new DynamoDB.DocumentClient();

export const handler = (event, context) => {
    let params = {
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
