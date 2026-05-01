"use strict";
const model = require('../models/recipeModel');

/** @function fetchAllRecipes */
// function that gets all the recipes from my database
async function fetchAllRecipes(req, res) {
    try {
        const recipes = await model.getAllRecipes();
        res.json(recipes);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
}

/** @function fetchRecipeById */
// function that gets a specific recipe from my database
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

/** @function fetchRecipesByType */
// function that gets a specific type of recipe from my database
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

/** @function removeRecipe */
// function that removes a recipe from my database
async function removeRecipe(req, res) {
    const id = req.params.id;
    // allowed allow user to delete their own recipes
    const recipe = await model.getOneRecipeById(id);
    if (!req.session.user_id || recipe.user_id !== req.session.user_id){
        return res.status(403).send("Not allowed");
    }
    if (id) {
        try {
            const deletedCount = await model.deleteRecipe(id);
            if (deletedCount > 0) {
                res.json({message: `Recipe ${id} deleted successfully`})
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

/** @function fetchNutrition */
// function that gets the info from the external API
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

/** @function createRecipe */
// function that adds a recipe from my database
async function createRecipe(req, res) {
    const { name, type, ingredients, steps } = req.body;
    const ntype = type.trim().toLowerCase();
    if (name && ntype && ingredients && steps) {
        try {
            const ingredientsList = ingredients
                .split(",")
                .map(i => {
                    const match = i.trim().match(/^(\d+)\s*(.*)$/);
                    if(match){
                        return{
                            qty: Number(match[1]),
                            name: match[2]
                        }
                    }
                    return{
                        qty: 1,
                        name: i.trim()
                    }
                });
            // Call API function
            const results = await Promise.all(
                ingredientsList.map(async (item) =>{
                    const response = await fetch(
                        `https://api.api-ninjas.com/v1/nutrition?query=${encodeURIComponent(item.name)}`,
                        {
                            headers:{
                                "X-Api-Key": process.env.API_NINJAS_KEY
                            }
                        }
                    )
                    // grab nutrition info
                    const nutrition = await response.json();
                    return nutrition?.[0] || {};
                })
            )
            // define the nutritional info into an array
            const ninfo = {
                serving_size_g: 0,
                fat_total_g: 0,
                fat_saturated_g: 0,
                sodium_mg: 0,
                potassium_mg: 0,
                cholesterol_mg: 0,
                carbohydrates_total_g: 0,
                fiber_g: 0,
                sugar_g: 0
            }
            // loop through the array to total the info based on each ingredient
            for(let i = 0; i < results.length; i++){
                const item = results[i];
                const qty = ingredientsList[i].qty || 1;
                ninfo.serving_size_g += (item.serving_size_g || 0) * qty;
                ninfo.fat_total_g += (item.fat_total_g || 0) * qty;
                ninfo.fat_saturated_g += (item.fat_saturated_g || 0) * qty;
                ninfo.sodium_mg += (item.sodium_mg || 0) * qty;
                ninfo.potassium_mg += (item.potassium_mg || 0) * qty;
                ninfo.cholesterol_mg += (item.cholesterol_mg || 0) * qty;
                ninfo.carbohydrates_total_g += (item.carbohydrates_total_g || 0) * qty;
                ninfo.fiber_g += (item.fiber_g || 0) * qty;
                ninfo.sugar_g += (item.sugar_g || 0) * qty;
            }
            // store them into individual variables to be stored into the database
            const servingSize = ninfo.serving_size_g ?? null;
            const fatTotal = ninfo.fat_total_g ?? null;
            const fatSaturated = ninfo.fat_saturated_g ?? null;
            const sodium = ninfo.sodium_mg ?? null;
            const potassium = ninfo.potassium_mg ?? null;
            const cholesterol = ninfo.cholesterol_mg ?? null;
            const carbohydratesTotal = ninfo.carbohydrates_total_g ?? null;
            const fiber = ninfo.fiber_g ?? null;
            const sugar = ninfo.sugar_g ?? null;

            // track the user who added recipe
            const user_id = req.session.user_id;
            // create the new recipe
            const newRecipe = await model.addRecipe(name, ntype, ingredients, steps, servingSize, fatTotal, fatSaturated, sodium, potassium, cholesterol, carbohydratesTotal, fiber, sugar, user_id);
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