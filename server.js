"use strict";
// my requirements
require('dotenv').config();

const express = require("express");
const session = require("express-session");

const app = express();

//needed for user log in and log out 
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

console.log(process.version);
// external API check here
console.log("KEY LOADED:", process.env.API_NINJAS_KEY);

const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


const recipeRoutes = require('./routes/recipeRoutes');
const userRoutes = require('./routes/userRoutes')

app.use('/api/recipes', recipeRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server listening on port: " + PORT + "!");
});