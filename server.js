require('dotenv').config()

const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 9898
const app = express()
const mongoose = require('mongoose')
const User = require('./model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

mongoose.connect('mongodb://localhost:27017/loginApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

//To get the library of body-parser
const bodyParse = require('body-parser')

//So the body-parser would be used as a middleware in order to parse the body property from the client
app.use(bodyParse.json())

//To server the static files, which are all within the static folder
app.use('/', express.static(path.join(__dirname, 'static')))

//To see the documents (records) from the User model (the db)
app.get('/api/register', async (req, res) => {
  const userSchema = await User.find({})

  res.send(userSchema)
})

//To clear the User db
app.delete('/api/register', async (req, res) => {
  await User.deleteMany()

  res.send('Cleared the Database')
})


//Endpoint for the register file in the static folder
app.post('/api/register', async (req, res) => {
  const {username, password} = req.body

  const saltRounds = 10

  bcrypt.genSalt(saltRounds, (req, salt) => {
    bcrypt.hash(password, salt, async (error, hashedPassword) => {
      if (error) {
        throw error
      } else {
        try {
          const user = await User.create({
            username,
            password: hashedPassword
          })

          console.log(user)
        } catch (error) {
          if (error.code === 11000) {
            console.log(`Username of ${username} already exists`)

            return res.json({status: 'error', message: `Username of ${username} already exists`})
          }

          throw error
        }
      }
    })
  })

  res.json({status: `ok`})
})

//To run the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))