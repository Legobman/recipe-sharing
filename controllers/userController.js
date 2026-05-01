"use strict";
const model = require('../models/userModel');
const bcrypt = require("bcrypt");

/** @function register */
// function that adds a user from my database
async function register(req, res){
    const {username, password} = req.body;
    if (!username || !password){
        return res.status(400).send("Missing fields");
    }
    try{
        const user = await model.createUser(username, password);
        res.json(user);
    } catch(err){
        console.error(err);
        res.status(500).send("User creation failed");
    }
}

/** @function login */
// function that checks if the user's login info matches anything in database then save it if it was successful
async function login(req, res){
    const {username, password} = req.body;
    const user = await model.getUser([username]);
    if(user && await bcrypt.compare(password, user.password)){
        req.session.user_id = user.id;
        req.session.username = user.username;
        res.json({user: user.username, id: user.id});
    } else{
        res.status(401).send("Invlide login");
    }
}

/** @function logout */
// function that deletes that the user is logged in
function logout(req, res) {
    req.session.destroy();
    res.send("Logged out");
}

/** @function getCurrentUser */
// function that grabs the logged in user's username and id
function getCurrentUser(req, res){
    if(req.session.user_id){
        res.json({
            id: req.session.user_id,
            username: req.session.username
        });
    } else{
        res.json(null);
    }
}

module.exports = {
    register,
    login,
    logout,
    getCurrentUser
};