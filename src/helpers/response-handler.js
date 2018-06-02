export const done = (error, res) => {
    return {
        statusCode: error ? error.statusCode : res.statusCode,
        body: error ? JSON.stringify(error) : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
    };
};
