
require('dotenv').config()

module.exports = {
    JWT_SECRET: process.env.ACCESS_TOKEN_SECRET,
    auth: {
        facebook: {
            CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
            CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
        },
        google: {
            CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
            CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
        }

    }
}