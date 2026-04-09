"use strict";
const express = require("express");
const app = express();

const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Server listening on port: " + PORT + "!");
});