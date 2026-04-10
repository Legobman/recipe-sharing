"use strict";
const pool = require('./dbConnection');

async function getAllRecipes() {
    const queryText = "SELECT * FROM recipes";
    const result = await pool.query(queryText);
    return result.rows;
}

async function getOneRecipeById(id) {
    const queryText = "SELECT * FROM recipes where id= $1";
    const values = [id];
    const result = await pool.query(queryText, values);
    return result.rows[0];
}

async function getRecipesByType(params) {
    const queryText = "SELECT * FROM recipes where type= $1";
    if (params.length > 1) {
        queryText += " AND price <= $2";
    }
    const result = await pool.query(queryText, params);
    return result.rows;
}


async function deleteRecipe(id) {
    let queryText = "DELETE FROM recipes WHERE id = $1 ";
    const values = [id];
    const result = await pool.query(queryText, values);
    return result.rowCount;
}

async function addRecipe(name, type, ingredients, steps, serving_size_g, fat_total_g, fat_saturated_g, sodium_mg, potassium_mg, cholesterol_mg, carbohydrates_total_g, fiber_g, sugar_g) {
    let queryText = `INSERT INTO recipes ( name, type, ingredients, steps, serving_size_g, fat_total_g, fat_saturated_g, sodium_mg, potassium_mg, cholesterol_mg, carbohydrates_total_g, fiber_g, sugar_g) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`;
    let values = [name, type, ingredients, steps, serving_size_g, fat_total_g, fat_saturated_g, sodium_mg, potassium_mg, cholesterol_mg, carbohydrates_total_g, fiber_g, sugar_g];
    const result = await pool.query(queryText, values);
    return result.rows[0];
}
module.exports = {
    getAllRecipes,
    getOneRecipeById,
    getRecipesByType,
    deleteRecipe,
    addRecipe
};