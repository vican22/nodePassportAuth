const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

//User model
const User = require('../models/User')

//Login Page
router.get('/login', (req, res) => res.render('Login'))

//Register Page
router.get('/register', (req, res) => res.render('Register'))

//Register handle
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body
    let errors = []

    //Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields' })
    }

    //Check email format
    var emailCheck = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;
    if (!emailCheck.test(email)) {
        errors.push({ msg: 'Email format is incorrect' })
    }
    //Check password match
    if (password !== password2) {
        errors.push({ msg: 'Password do not match' })
    }

    //Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be at least 6 characters' })
    }

    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })

    }
    else {
        //Validation passed
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    //User exists
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    })
                }
                else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })

                    //hash password
                    bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        //Set password to hashed
                        newUser.password = hash

                        //Save user
                        newUser.save()
                            .then(user => {
                                res.redirect('/users/login')
                            })
                            .catch(err => console.log(err))
                    }))
                }
            })
    }
})
module.exports = router