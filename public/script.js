"use strict";
// current user variable
let currentUser = null;

/** @function nameless */
// main function that runs the core functionality
(function () {
  const MY_SERVER_BASEURL = "/api/recipes";
  window.addEventListener("load", init);
  
  /** @function init */
  // function that makes sure the page loads correctly with what needs to be visible 
  // or not and loads all needed functions
  function init() {
    currentUser = null;
    updateUI();
    
    id("login-btn").addEventListener("click", login);
    id("logout-btn").addEventListener("click", logout);
    id("reg-btn").addEventListener("click", displayRegister);
    id("home").addEventListener("click", home);
    id("breakfast").addEventListener("click", () => recipesByType("breakfast"));
    id("dessert").addEventListener("click", () => recipesByType("dessert"));
    id("addUser").addEventListener("click", function(e){
      e.preventDefault();
      register();
    });
    // make sure user stays logged in if they refresh the page
    fetch("/api/users/me")
      .then(res => res.json())
      .then(user => {
        currentUser = user;
        updateUI();
        getRecipes();
      });
      
  }

  /** @function getRecipes */
  // function that grabs every recipe from the recipe table
  function getRecipes() {
    let recipesDiv = id("recipes-container");
    fetch(MY_SERVER_BASEURL + "/")
      .then(checkStatus)
      .then((response) => {
        for (const item of response) {
          addParagraph(recipesDiv, item);
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }
  
  /** @function getRecipes */
  // function that loads every recipe into the recipe container, with each getting 
  // their own article
  function addParagraph(recipesDiv, recipeObject) {
    let article = document.createElement("article");
    let heading = document.createElement("h3");
    heading.appendChild(document.createTextNode(recipeObject.name));
    let para = document.createElement("p");
    para.appendChild(document.createTextNode("Type: " + recipeObject.type + ", Ingredients: " + recipeObject.ingredients + ", Carbs(g): " + recipeObject.carbohydrates_total_g + ", Fat(g): " +recipeObject.fat_total_g));
    article.appendChild(heading);
    article.appendChild(para);
    // details button
    let detBtn = document.createElement("button");
    detBtn.textContent = "Details";
    detBtn.addEventListener("click", () =>{
        fetch(`/api/recipes/${recipeObject.id}`)
        .then(checkStatus)
        .then(recipe =>{
          showDetails(recipe);
        })
        .catch(alert);
      })
    article.appendChild(detBtn);
    // add delete button if logged and the recipe's owner
    if(currentUser && Number(recipeObject.user_id) === Number(currentUser.id)){
      let delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () =>{
        fetch(`/api/recipes/${recipeObject.id}`, {
          method: "DELETE"
        })
        .then(checkStatus)
        .then(refreshTable)
        .catch(alert);
      })
      article.appendChild(delBtn);
    }
    recipesDiv.appendChild(article);
  }

  let saveButton = id("save-recipe");
  saveButton.addEventListener("click", function (e) {
    e.preventDefault();
    submitForm();
  });

  /** @function submitForm */
  // function that takes info from the users and attempts to upload it into the database
  // as a new recipe
 function submitForm() {
    let params = new FormData(id("form-container")); // pass in entire form tag
    let obj = Object.fromEntries(params);
    obj.ingredients = obj.ingredients.replaceAll(",", " and ");
    let jsonBody = JSON.stringify(obj); //make form data json string.
    
    fetch(MY_SERVER_BASEURL + "/", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: jsonBody,
    })
      .then(checkStatus)
      .then(refreshTable)
      .catch(alert);
  }

  /** @function refreshTable */
  // function that resets the recipe list whenever it needs to go back to its default
  function refreshTable() {
    id("form-container").reset();
    document.querySelectorAll("article").forEach((element) => {
      element.remove();
    });
    getRecipes();
  }

  /** @function id */
  // function to reduce how much I have to type document.getElementById
  function id(idName) {
    return document.getElementById(idName);
  }

  /** @function checkStatus */
  // another function to reduce repetitive typing
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response.json();
  }

  /** @function login */
  // function to attempt to log in the user based on given info
  function login(){
    fetch("/api/users/login", {
      method:"POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: id("username").value,
        password: id("password").value
      })
    })
    .then(checkStatus)
    .then(user => {
      currentUser = user;
      updateUI();
      refreshTable();
      id("username").value = "";
      id("password").value = "";
    })
    .catch(alert);
  }

  /** @function logout */
  // function to clear out that the user is logged in
  function logout(){
    fetch("/api/users/logout", {method: "POST"})
      .then(() => {
        currentUser = null;
        updateUI();
        refreshTable();
      })
  }

  /** @function updateUI */
  // function to change what is shown based on if user is logged in or not
  function updateUI(){
    if(!currentUser){
      id("form-container").style.display = "none";
      id("login-btn").style.display = "inline";
      id("logout-btn").style.display = "none";
      id("reg-btn").style.display = "inline";
    } else{
      id("form-container").style.display = "block";
      id("login-btn").style.display = "none";
      id("logout-btn").style.display = "inline";
      id("reg-btn").style.display = "none";
    }
  }
  
  /** @function displayRegister */
  // function to toggle elements connected to button for visibility
  function displayRegister(){
    id("reg-form").classList.toggle("show");
  }

  /** @function register */
  // function to attempt to add a new user to the database
  function register(){
    fetch("/api/users/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        username: id("reg-username").value,
        password: id("reg-password").value
      })
    })
    .then(checkStatus)
    .then(() =>{
      alert("User created! You can now log in.");
      id("reg-username").value = "";
      id("reg-password").value = "";
      id("reg-form").classList.remove("show");
    })
    .catch(alert);
  }

  /** @function home */
  // function to reset the page without refreshing
  function home(){
    hideForms();
    refreshTable(); 
    const display = id("recipe-details");
    display.classList.remove("show");
  }
  
  /** @function hideForms */
  // function that hides register form and add recipe form, if not logged in
  function hideForms(){
    id("reg-form").classList.remove("show");
    if(!currentUser){
      id("form-container").style.display = "none";
    }
  }

  /** @function recipesByType */
  // function that displays all the info about a specific recipe
  function recipesByType(type){
    hideForms();
    let recipesDiv = id("recipes-container");
    document.querySelectorAll("article").forEach((element) => {
      element.remove();
    });
    fetch(`/api/recipes/type/${type}`)
      .then(checkStatus)
      .then((response) => {
        for (const item of response) {
          addParagraph(recipesDiv, item);
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }

  /** @function showDetails */
  // function that displays all the info about a specific recipe
  function showDetails(recipe){
    const display = id("recipe-details");
    display.classList.add("show")
    display.textContent = "";
    const name = document.createElement("h3");
    name.textContent = "Recipe Name: " + recipe.name;
    const type = document.createElement("p");
    type.textContent = "Recipe Type: " + recipe.type;
    const ingredients = document.createElement("p");
    ingredients.textContent = "Ingredient: " + recipe.ingredients;
    const steps = document.createElement("p");
    steps.textContent = "Steps: " + recipe.steps;
    const seringSize = document.createElement("p");
    seringSize.textContent = "Serving Size(g): " + recipe.serving_size_g;
    const tFats = document.createElement("p");
    tFats.textContent = "Total Fat(g): " + recipe.fat_total_g;
    const sFats = document.createElement("p");
    sFats.textContent = "Saturated Fat(g): " + recipe.fat_saturated_g;
    const sodium = document.createElement("p");
    sodium.textContent = "Sodium(mg): " + recipe.sodium_mg;
    const potassium = document.createElement("p");
    potassium.textContent = "Potassium(mg): " + recipe.potassium_mg;
    const chol = document.createElement("p");
    chol.textContent = "Cholestterol(mg): " + recipe.cholesterol_mg;
    const carbs = document.createElement("p");
    carbs.textContent = "Total Carbs(g): " + recipe.carbohydrates_total_g;
    const fiber = document.createElement("p");
    fiber.textContent = "Fiber(g): " + recipe.fiber_g;
    const suger = document.createElement("p");
    suger.textContent = "suger(g): " + recipe.sugar_g;
    const column1 = document.createElement("div");
    const column2 = document.createElement("div");
    column1.appendChild(name);
    column1.appendChild(type);
    column1.appendChild(ingredients);
    column1.appendChild(steps);
    column2.appendChild(seringSize);
    column2.appendChild(tFats);
    column2.appendChild(sFats);
    column2.appendChild(sodium);
    column2.appendChild(potassium);
    column2.appendChild(chol);
    column2.appendChild(carbs);
    column2.appendChild(fiber);
    column2.appendChild(suger);
    display.appendChild(column1);
    display.appendChild(column2);
  }
})();

