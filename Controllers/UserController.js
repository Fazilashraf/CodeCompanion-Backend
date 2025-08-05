const mongoose = require('mongoose')

const users = require('../Models/UserSchema')
const jwt = require('jsonwebtoken')

//REgisteR LOgiC
exports.registerAPI = async (req, res) => {
    console.log("Inside Register API");
    const { username, email, password } = req.body;
    //if user already in DB
    const existingUser = await users.findOne({ email })
    if (existingUser) {
        res.status(402).json({ message: "User already existing..." })
    } else {
        const newUser = new users(
            {
                username: username,
                email: email,
                password: password,
                github: "",
                linkedIn: "",
                profilePic: ""
            }
        )
        //to save the details in mongoDB
        await newUser.save()
        res.status(200).json('User Registration Success...')
    }
}

// Login API
exports.loginAPI = async (req, res) => {
    console.log("Inside login API");
    const { email, password } = req.body;
    //if user already in DB
    try {
        const existingUser = await users.findOne({ email, password })
        if (existingUser) {
            const token = jwt.sign({ userId: existingUser._id }, process.env.jwtKey)
            console.log(token);
            res.status(200).json({ currentUser: existingUser, token })
        } else {
            res.status(404).json('Incorrect email or password')
        }
    }
    catch (err) {
        res.status(401).json(err)
    }
}

// PUT /api/updateUser
exports.updateUserAPI = async (req, res) => {
    console.log("Inside update user API");

    const { username, github, linkedIn } = req.body;
    const userId = req.payload; // from jwt middleware

    try {
        const user = await users.findByIdAndUpdate(
            userId,
            {
                username,
                github,
                linkedIn,
            },
            { new: true }
        );

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: "User update failed", error: err });
    }
};

exports.getUserDetailsAPI = async (req, res) => {
  const userId = req.payload; // from jwt middleware

  try {
    const user = await users.findById(userId).select('-password'); // exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err });
  }
};