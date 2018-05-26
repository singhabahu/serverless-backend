'use strict';
import {DynamoDB} from 'aws-sdk';
import uuid from 'uuid/v4';

/**
 * Manage actions related to users
 * @param  {object} event
 * @param  {object} context
 * @param  {object} callback
 */
export const all = (event, context, callback) => {
  const IS_OFFLINE = process.env.IS_OFFLINE;
  const USERS_TABLE = process.env.USERS_TABLE;

  let dynamo;
  if (IS_OFFLINE === 'true') {
    dynamo = new DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000',
    });
  } else {
    dynamo = new DynamoDB.DocumentClient();
  };

  const done = (err, res) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err ? err.message : JSON.stringify(res),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });

  switch (event.httpMethod) {
    case 'DELETE':
      dynamo.delete({
        TableName: USERS_TABLE, Key: {uuid: event.pathParameters.uuid},
      }, done);
      break;
    case 'GET':
      dynamo.scan({TableName: USERS_TABLE}, done);
      break;
    case 'POST':
      let body = JSON.parse(event.body);
      body.uuid = uuid();
      const params = {
        TableName: USERS_TABLE,
        Item: body,
      };
      dynamo.put(params, done);
      break;
    // TODO Create PUT event
    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }
};
