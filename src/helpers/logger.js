import packageJson from '../../package.json';
/**
 * Logger class
 */
class Logger {
    /**
     * Reusable log function, can be used to display a detailed logging info.
     * @param {*} message
     * @param {*} level - can be either ERROR, INFO or WARNING, Default is ERROR
     */
    static log(message, level = 'ERROR') {
        let msg = {
            level: level,
            dateTime: new Date().toISOString(),
            version: packageJson.version,
            env: process.env.STAGE,
            data: message,
        };
        console.log(JSON.stringify(msg));
    }
};

export default Logger;
