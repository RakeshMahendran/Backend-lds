const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/userModel')

const signup = async (req, res) => {
    User.find({email: req.body.email})
       .exec()
       .then( user => {
        if (user.length >= 1 ) {
            return res.status(409).json({
                message: 'Mail already exists'
            });
        } else{ 
             bcrypt.hash(req.body.password, 10, (err,hash) => {
            if(err) {
                return res.status(500).json({
                    message: err.message
                });
               }   else{
          const user = new User({
            email: req.body.email,
            password: hash
      });
          user
          .save()
          .then(result => {
              console.log(result); 
              res.status(201).json({
                message: 'User created'
               });
          }).catch(err => {
            console.log(err);
            res.status(500).json({ 
                error: err
            })
          });
    }
        });
        }
       })
       .catch();

 

};

module.exports = { signup };
