"use strict";
require('dotenv').config();

const express = require("express");
const app = express();

console.log(process.version);
console.log("KEY LOADED:", process.env.API_NINJAS_KEY);

const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


const recipeRoutes = require('./routes/recipeRoutes');

app.use('/api/recipes', recipeRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server listening on port: " + PORT + "!");
});