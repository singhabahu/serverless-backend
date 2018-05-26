'use strict';
import {DynamoDB} from 'aws-sdk';
import uuid from 'uuid/v4';

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

    const ROLES_TABLE = process.env.ROLES_TABLE;
    switch (event.httpMethod) {
        case 'DELETE':
          dynamo.delete({
            TableName: ROLES_TABLE, Key: {uuid: JSON.parse(event.body).uuid},
          }, done);
          break;
        case 'GET':
          dynamo.scan({TableName: ROLES_TABLE}, done);
          break;
        case 'POST':
          let body = JSON.parse(event.body);
          body.uuid = uuid();
          const params = {
            TableName: ROLES_TABLE,
            Item: body,
          };
          dynamo.put(params, done);
          break;
        // TODO Create PUT event
        default:
          done(new Error(`Unsupported method "${event.httpMethod}"`));
      }
};
