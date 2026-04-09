"use strict";
const model = require('../models/recipeModel');

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
            const newRecipe = await model.addRecipe(name, type, ingredients, steps);
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
    fetchAllRecipes,
    fetchRecipeById,
    fetchRecipesByType,
    removeRecipe,
    createRecipe
};