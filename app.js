const express = require('express')
const path = require('path')
const logger = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const LOGGER = require('./server/utils/logger')

const usersRouter = require('./server/routers/authRouter')

// set up dependencies
const app = express()
require('dotenv').config()

// Middleware
app.use(cors())
app.use(logger('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'server/public')))
app.use(helmet())
// app.use(ipIdentify)

// HOST + PORT
const host = process.env.HOST
const port = process.env.PORT
const PREFIX = process.env.PREFIX

// logger

app.use((req, res, next) => {
  LOGGER.HTTP.request(req)
  next()
})

// Route api 
app.use(`${PREFIX}/user`, usersRouter)

// Handle unknown route
app.use((req, res) => {
  res.status(404).send({
    result: false,
    message: `${req.url} not found!`
  })
})

app.listen(port, () => {
  console.log(`Server is listening on ${host}:${port}`)
  setTimeout(() => {
    // make seed
    require('./server/seed/seed').initializeAdmin('devhuy@gmail.com', 'abc123')
  }, 10000);
})

