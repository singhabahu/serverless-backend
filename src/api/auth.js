'use-strict';
import * as jwk from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import * as request from 'request';

const iss = process.env.ISS;

/**
 * Generate policy to allow this user on this API
 * @param {*} principalId
 * @param {*} effect
 * @param {*} resource
 * @return {*} policyDocument
 */
const generatePolicy = (principalId, effect, resource) => {
    const authResponse = {};
    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }
    return authResponse;
};

/**
 * Reusable Authorizer function, set on `authorizer` field in serverless.yml
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export const authorize = (event, context, callback) => {
    if (event.authorizationToken) {
        const token = event.authorizationToken.substring(7);
        request(
            {url: `${iss}.well-known/jwks.json`, json: true},
            (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    callback('Unauthorized');
                }
                const keys = body;
                const k = keys.keys[0];
                const jwkArray = {
                    kty: k.kty,
                    n: k.n,
                    e: k.e,
                };
                const pem = jwkToPem(jwkArray);
                jwk.verify(token, pem, {issuer: iss.slice(0, -1)},
                    (error, decoded) => {
                        if (error) {
                            callback('Unauthorized');
                        } else {
                            callback(null, generatePolicy(decoded.sub,
                                'Allow', event.methodArn));
                        }
                    });
            });
    } else {
        callback('Unauthorized');
    }
};
