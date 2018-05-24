'use strict';
import {DynamoDB} from 'aws-sdk';

/**
 * Manage actions related to roles
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 */
export const all = (event, context, callback) => {
    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    });

    let dynamo;
    if (process.env.IS_OFFLINE === 'true') {
        dynamo = new DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000',
        });
    } else {
        dynamo = new DynamoDB.DocumentClient();
    };

    if (event.httpMethod == 'GET') {
        dynamo.scan({
            TableName: process.env.USERS_TABLE,
            AttributesToGet: ['role'],
        }, (err, res) => {
            if (err) done(err);
            res.Items = [...new Set(res.Items.map((user) => user.role))];
            done(null, res);
        });
    } else {
        done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
