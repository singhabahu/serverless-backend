import merge from 'lodash/merge';
import packageJson from '../../package.json';

// Default configurations applied to all environments
const defaultConfigs = {
    env: process.env.ENV || 'dev',
    version: packageJson.version,
};

// Environment specific overrides
const environmentConfigs = {
    dev: {
        cognito: {
            userPoolId: process.env.USER_POOL_ID || 'us-east-1_HetaxzWw5',
            ISS: process.env.USER_POOL_ID || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_HetaxzWw5/',
        },
        db: {
            host: process.env.USER_POOL_ID || '52.15.81.107',
            user: process.env.USER_POOL_ID || 'root',
            password: process.env.USER_POOL_ID || 'password',
            port: process.env.USER_POOL_ID || 3306,
            name: process.env.USER_POOL_ID || 'ovinway',
            dialect: process.env.USER_POOL_ID || 'mysql',
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000,
            },
        },
    },
    prod: {
        cognito: {
            userPoolId: process.env.USER_POOL_ID || 'us-east-1_HetaxzWw5',
            ISS: process.env.USER_POOL_ID || 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_HetaxzWw5/',
        },
        db: {
            dbHost: process.env.USER_POOL_ID || '52.15.81.107',
            dbUser: process.env.USER_POOL_ID || 'root',
            dbPassword: process.env.USER_POOL_ID || 'password',
            dbPort: process.env.USER_POOL_ID || 3306,
            dbName: process.env.USER_POOL_ID || 'ovinway',
            dbDialect: process.env.USER_POOL_ID || 'mysql',
        },
    },
};

export default merge(defaultConfigs, environmentConfigs[process.env.ENV] || {});
