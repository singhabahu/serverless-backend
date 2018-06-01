import Constants from '../config/constants';

/**
 * Logger class
 */
class Logger {
    /**
     * Reusable log function, can be used to display a detailed logging info.
     * @param {*} message
     * @param {*} level
     */
    static log(message, level = 'ERROR') {
        let errMsg = {
            level: level,
            dateTime: new Date().toISOString(),
            version: Constants.version,
            appName: Constants.name,
            env: Constants.env,
            data: message,
        };
        console.log(JSON.stringify(errMsg));
    }
};

export default Logger;
