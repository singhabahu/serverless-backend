'use-strict';
import * as jwk from 'jsonwebtoken';
import * as jwkToPem from 'jwk-to-pem';
import * as request from 'request';

const iss = process.env.ISS;

// Reusable Authorizer function, set on `authorizer` field in serverless.yml
export const authorize = (event, context, cb) => {
    console.log('Auth function invoked');
    if (event.authorizationToken) {
        // Remove 'bearer ' from token:
        const token = event.authorizationToken.substring(7);
        // Make a request to the iss + .well-known/jwks.json URL:
        request(
            {url: `${iss}.well-known/jwks.json`, json: true},
            (error, response, body) => {
                if (error || response.statusCode !== 200) {
                    console.log('Request error:', error);
                    cb('Unauthorized');
                }
                const keys = body;
                // Based on the JSON of `jwks` create a Pem:
                const k = keys.keys[0];
                const jwkArray = {
                    kty: k.kty,
                    n: k.n,
                    e: k.e,
                };
                const pem = jwkToPem(jwkArray);

                // Verify the token:
                jwk.verify(token, pem, {issuer: iss}, (err, decoded) => {
                    if (err) {
                        console.log('Unauthorized user:', err.message);
                        cb('Unauthorized');
                    } else {
                        cb(null, decoded.sub);
                    }
                });
            });
    } else {
        console.log('No authorizationToken found in the header.');
        cb('Unauthorized');
    }
};
