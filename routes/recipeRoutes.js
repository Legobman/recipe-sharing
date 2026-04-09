"use strict";
const express = require("express");
const router = express.Router();
const recipeController = require('../controllers/recipeController');

router.get("/", recipeController.fetchAllReccipes);
router.get("/:id", recipeController.fetchRecipeById);
router.get("/type/:type", recipeController.fetchRecipesByType);
router.post("/", recipeController.createRecipe);
router.delete("/:id", recipeController.removeRecipe);
module.exports = router;