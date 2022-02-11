const express = require('express');
const router = express.Router();
let User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const secret = process.env.JWT_TOKEN
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', async(req,res) => {
  const {email, password} = req.body;

  try {
    let user = await User.findOne({email})
    if(!user)
      res.status(401).json({error: 'email not found'})
    else
      user.isCorrectPassword(password, function (err, same) {
        if(!same)
          res.status(401).json({ error: "Incorrect email/password" });
        else{
          const token = jwt.sign({email}, secret, {expiresIn: '1d'})
          res.json({user: user,token: token})
        }
    })
    } catch (error) {
    
  }
})

router.post('/register', async(req,res) => {
  const {username , email, password} = req.body;
  const user = new User({username, email, password});

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error + ' Error to create user on db')
  }
})

module.exports = router;
