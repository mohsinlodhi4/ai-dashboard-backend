const path = require('path');

const getProjectRootPath = () => path.resolve(__dirname, '..');
const successResponse = (msg='', data={} ) => ( { message: msg, data: data, success: true} );
const errorResponse = (msg='', data={}) => ({ message: msg, data: data, success: false});

const randomString = (len= 5) => Math.random().toString(36).slice(len).toUpperCase();
const  convertToSlug = (inputString = "") => inputString.toLowerCase().replace(/\s+/g, '-');

module.exports = {
    successResponse,
    errorResponse,
    randomString,
    getProjectRootPath,
    convertToSlug,
}