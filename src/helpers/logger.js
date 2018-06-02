import packageJson from '../../package.json';
/**
 * Logger class
 */
class Logger {
    /**
     * Reusable log function, can be used to display a detailed logging info.
     * @param {*} message -
     *              include a value and the level
     *              level can be either ERROR, INFO or WARNING, Default one is ERROR
     */
    static log(message) {
        let msg = {
            level: message.level,
            dateTime: new Date().toISOString(),
            version: packageJson.version,
            env: process.env.STAGE,
            data: message.value,
        };
        console.log(JSON.stringify(msg));
    }
};

export default Logger;
