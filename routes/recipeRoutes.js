"use strict";
const express = require("express");
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get("/nutrition", recipeController.fetchNutrition);
router.get("/", recipeController.fetchAllRecipes);
router.get("/type/:type", recipeController.fetchRecipesByType);
router.get("/:id", recipeController.fetchRecipeById);
router.post("/", recipeController.createRecipe);
router.delete("/:id", recipeController.removeRecipe);
module.exports = router;