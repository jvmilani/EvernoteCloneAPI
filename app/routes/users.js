const express = require('express');
const router = express.Router();
let User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = process.env.JWT_TOKEN
const withAuth = require('../middlewares/auth')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email })
    if (!user)
      res.status(401).json({ error: 'email not found' })
    else
      user.isCorrectPassword(password, function (err, same) {
        if (!same)
          res.status(401).json({ error: "Incorrect email/password" });
        else {
          const token = jwt.sign({ email }, secret, { expiresIn: '1d' })
          res.json({ user: user, token: token })
        }
      })
  } catch (error) {

  }
})

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const user = new User({ username, email, password });

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error + ' Error to create user on db')
  }
})

router.put('/', async (req, res) => {
  const { name, email, id } = req.body;
  console.log(id);
  try {
    let updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: { username: name, email: email } },
      { upsert: true, 'new': true })
    updatedUser.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(error + ' Error to update user on db')
  }
})

router.put('/password', withAuth, async function (req, res) {
  const { password } = req.body;

  try {
    var user = await User.findOne({ _id: req.user._id })
    user.password = password
    user.save()
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: error });
  }
});

router.delete('/', withAuth, async function (req, res) {
  try {
    let user = await User.findOne({ _id: req.user._id });
    await user.delete();
    res.json({ message: 'OK' }).status(201);
  } catch (error) { 
    res.status(500).json({ error: error });
  }
});
module.exports = router;
