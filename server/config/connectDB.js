const CONFIG = require( './config')
const LOGGER = require( '../utils/logger')

require('dotenv').config()

const { DB_CONFIG } = CONFIG
const knex = require('knex')(DB_CONFIG)

knex.on('query', LOGGER.DB.query)
knex.on('query-error', LOGGER.DB.error.bind(LOGGER.DB))
knex.on('query-response', LOGGER.DB.query)

function initialize () {
  // user
  require('../Models/authModel').userModel(knex)
}

initialize()
module.exports = knex
