const Ajv = require( 'ajv')
const addFormats = require( 'ajv-formats')
const ajvErrors = require( 'ajv-errors')

const ajvInstance = new Ajv({ allErrors: true })
addFormats(ajvInstance)
ajvErrors(ajvInstance)

module.exports = ajvInstance
