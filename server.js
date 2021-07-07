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

const bodyParse = require('body-parser')

app.use(bodyParse.json())

app.use('/', express.static(path.join(__dirname, 'static')))

app.post('/api/login', async (req, res) => {
  const {username, password} = req.body

  const user = await User.findOne({username}).lean()

  if (!user) {
    return res.json({status: 'error', error: `The username and/or password are invalid ${user.username, user.password}`})
  }

  if (await bcrypt.compare(password, user.password)) {
    // The username & password are valid

    const token = jwt.sign({id: user._id, username: user.username}, process.env.JWT_SECRET)

    return res.json({status: 'ok', data: token})
  }

  res.json({status: 'error', error: `The username and/or password are invalid`})
})

app.post('/api/register', async (req, res) => {
  const {username, password} = req.body
  const bcryptedPassword = await bcrypt.hash(password, 10)

  try {
    if (username.length < 3 || typeof username != 'string') {
      return res.send(`Username of ${username} is invalid`)
    }

    if (password.length < 5 || typeof password != 'string') {
      return res.send('Password is invalid')
    }

    const userCreated = await User.create({
      username: username,
      password: bcryptedPassword
    })

    console.log(`The user has been created successfully ${userCreated}`)

    res.status(200).json("All good!")
  } catch (error) {
    if (error.code === 11000) {
      console.log(`The username of ${username} already exists`)

      return res.send(`The username of ${username} already exists`)
    }

    res.json({status: 'error'})

    throw `ERROR: ${error}`
  }
})

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))