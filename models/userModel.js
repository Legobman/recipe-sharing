"use strict";
const pool = require('./dbConnection');
const bcrypt = require("bcrypt");

async function createUser(username, password){
    const hpassword = await bcrypt.hash(password, 10);
    let queryText = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *`;
    let values = [username, hpassword];
    const result = await pool.query(queryText, values);
    return result.rows[0];
}

async function getUser(params){
    const queryText = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(queryText, params);
    return result.rows[0];
}

module.exports = {
    createUser,
    getUser
};