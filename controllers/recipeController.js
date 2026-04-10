"use strict";
const model = require('../models/recipeModel');

async function fetchNutrition(req, res){
    const {ingredients} = req.query;

    if(!ingredients){
        return res.status(400).send("Missing ingredients")
    }
    try{
        const response = await fetch(
            `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(ingredients)}`,
            {
                headers:{
                    "X-Api-Key": process.env.API_NINJAS_KEY
                }
            }
        )

        const data = await response.json();
        res.json(data);
    } catch(err){
        console.error(err);
        res.status(500).send("API error");
    }
}
async function fetchAllRecipes(req, res) {
    try {
        const recipes = await model.getAllRecipes();
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
}

async function fetchRecipeById(req, res) {
    const id = req.params.id;
    if (id) {
        try {
            const recipe = await model.getOneRecipeById(id);
            res.json(recipe);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    } else {
        res.status(400).send("Missing required id param!");
    }
}

async function fetchRecipesByType(req, res) {
    const type = req.params.type;
    const price = req.query.steps;
    let params;
    if (type) {
        try {
            params = [type];
            if (price) {
                params.push(price);
            }
            const recipes = await model.getRecipesByType(params);
            res.json(recipes);
        }
        catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    } else {
        res.status(400).send("Missing required type param!");
    }
}

async function removeRecipe(req, res) {
    const id = req.params.id;
    if (id) {
        try {
            const deletedCount = await model.deleteRecipe(id);
            if (deletedCount > 0) {
                res.send(`Product with id ${id} deleted successfully.`);
            } else {
                res.status(404).send("Product not found.");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    } else {
        res.status(400).send("Missing required id param!");
    }
}

async function createRecipe(req, res) {
    const { name, type, ingredients, steps } = req.body;
    if (name && type && ingredients && steps) {
        try {
            // Call API function
            const response = await fetch(
                `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(ingredients)}`,
                {
                    headers:{
                        "X-Api-Key": process.env.API_NINJAS_KEY
                    }
                }
            )
            // grab nutrition info
            const nutrition = await response.json();
            const ninfo = nutrition?.[0] || {};
            const servingSize = ninfo.serving_size_g ?? null;
            const fatTotal = ninfo.fat_total_g ?? null;
            const fatSaturated = ninfo.fat_saturated_g ?? null;
            const sodium = ninfo.sodium_mg ?? null;
            const potassium = ninfo.potassium_mg ?? null;
            const cholesterol = ninfo.cholesterol_mg ?? null;
            const carbohydratesTotal = ninfo.carbohydrates_total_g ?? null;
            const fiber = ninfo.fiber_g ?? null;
            const sugar = ninfo.sugar_g ?? null;
            const newRecipe = await model.addRecipe(name, type, ingredients, steps, servingSize, fatTotal, fatSaturated, sodium, potassium, cholesterol, carbohydratesTotal, fiber, sugar);
            res.status(201).json(newRecipe);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    } else {
        res.status(400).send("Missing required product fields!");
    }
}

module.exports = {
    fetchNutrition,
    fetchAllRecipes,
    fetchRecipeById,
    fetchRecipesByType,
    removeRecipe,
    createRecipe
};