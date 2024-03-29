require('dotenv').config();
const secret = process.env.JWT_TOKEN;

const jwt = require('jsonwebtoken');
const User =  require('../models/user');

const WithAuth = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if(!token)
        res.status(401).json({error: 'Unauthorized: invalid token'})
    else
        jwt.verify(token, secret, (error, decode) => {
            if(error)
                res.status(401).json({ error: "Unauthorized: invalid token" });
            else{
                req.email = decode.email;
                User.findOne({email: decode.email}).then(user => {
                    req.user = user;
                    next();
                }).catch(err => {
                    res.status(401).json({ error: err });
                })
            }
        })
}

module.exports = WithAuth;