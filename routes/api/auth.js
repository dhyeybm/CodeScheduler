const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
//Item Model
const User = require('../../models/user');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');
//@route  POST api/auth
// @desc Authenticate users
//@access Public
router.post('/',(req,res)=>{
   const { email, password } = req.body;

    //Simple validation
    if(!email || !password){
        return res.status(400).json({ msg: 'Please enter all fields '});
    }

    //Check for existing user
    User.findOne({ email })
        .then(user => {
            if(!user){
                return res.status(400).json({ msg: 'User Does not exists' });
            }
            //Validate password
            bcrypt.compare(password,user.password)
                .then(isMatch => {
                    if(!isMatch){
                        return res.status(400).json({msg: 'Invalid Password'});
                    }
                    jwt.sign(
                        { id: user.id },
                        config.get('jwtSecret'),
                        { expiresIn: 3600 },
                        (err,token)=>{
                            if(err){
                                throw err;
                            }
                            res.json({
                                token,
                                user:{
                                    id: user.id,
                                    name: user.name,
                                    email: user.email
                                }
                            });
                        }
                    ) 
                })
        })      
});

// @routte GET api/auth//user
//@desc Auth user
//@ access private
router.get('/user',auth , (req,res)=>{
    User.findById(req.user.id)
        .select('-password')
        .then(user => res.json(user));
});

module.exports = router;
