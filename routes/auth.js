const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const USER = mongoose.model("USER");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const { jwt_secret } = require('../key');
const requireLogin = require('../middlewares/requireLogin');







//routes for signup
router.post("/signup", (req, res) => {
    const { name, username, email, password } = req.body;

    if (!name || !email || !username || !password) {
        return res.status(422).json({ error: "Please add all the fileds." })
    }

    USER.findOne({ $or: [{ email: email }, { username: username }] }).then((savedUser) => {
        if (savedUser) {
            return res.status(422).json({ error: "user already exists with email or username" })
        }

        bcrypt.hash(password, 12).then((hashedPassword) => {
            const user = new USER({
                name,
                email,
                username,
                password: hashedPassword
            })
            user.save()
                .then(user => {
                    res.json({ message: "Registered successfully" })
                })
                .catch(err => console.log("error", err));
        })
    })


}) // if user is already exists



//routes for signin
router.post("/signin", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email and password" });
    }
    USER.findOne({ email: email }).then((savedUser) => {
        if (!savedUser) {
            return res.status(422).json({ error: "Invalid email" });
        }
        // console.log(savedUser);
        bcrypt.compare(password, savedUser.password).
            then((match) => {
                if (match) {
                    // return res.status(200).json({ message: "Signed in Successfully" })

                    //generate access token
                    try {
                        const token = jwt.sign({ _id: savedUser.id }, jwt_secret);
                        const { _id, name, email, username } = savedUser
                        res.json({ token, user: { _id, name, email, username } });

                        console.log({ token, user: { _id, name, email, username } });

                    } catch (err) {
                        console.error('Error signing JWT:', err);
                    }
                }
                else {
                    return res.status(422).json({ error: "Invalid password" })
                }
            })
            .catch(err => {
                console.log(err);
            })
    })
})



module.exports = router;