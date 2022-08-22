const db = require( '../config/connectDB')
const LOGGER = require( '../utils/logger')
const bcrypt = require( 'bcryptjs')

class Seed {
    static async initializeAdmin(email,password) {
        try {
            const connection = db('user')
      
            const existingUser = await connection.clone().where({ email: email.trim() }).first();
            if (existingUser) {
              return
            }

            const hashedPassword = bcrypt.hashSync(password, 8)
      
            const dataToBeInserted = {
              email: email.trim(),
              password: hashedPassword,
            }
      
            const [id] = await connection.clone().insert(dataToBeInserted, ['id']);
            LOGGER.APP.info('id admin inserted ', id)
          } catch (error) {
            LOGGER.APP.error(error.stack)
            return
          }
    }
}

module.exports = Seed