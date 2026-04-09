//script.js
"use strict";
(function () {
  const MY_SERVER_BASEURL = "/api/products";
  window.addEventListener("load", init);
  function init() {
    getProducts();
  }
  function getProducts() {
    let productsDiv = id("products-container");
    fetch(MY_SERVER_BASEURL + "/type/furniture")
      .then(checkStatus)
      .then((response) => {
        for (const item of response) {
          addParagraph(productsDiv, item);
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
      });
  }
  function addParagraph(productsDiv, productObject) {
    let article = document.createElement("article");
    let heading = document.createElement("h3");
    heading.appendChild(document.createTextNode(productObject.name));
    let para = document.createElement("p");
    para.appendChild(document.createTextNode("Type: " + productObject.type + ", Price: $" + productObject.price));
    article.appendChild(heading);
    article.appendChild(para);
    productsDiv.appendChild(article);
  }

  //script.js
  let saveButton = id("save-product");
  saveButton.addEventListener("click", function (e) {
    e.preventDefault();
    submitForm();
  });

 function submitForm() {
    let params = new FormData(id("form-container")); // pass in entire form tag
    let jsonBody = JSON.stringify(Object.fromEntries(params)); //make form data json string.
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

  function refreshTable() {
    id("form-container").reset();
    document.querySelectorAll("article").forEach((element) => {
      element.remove();
    });
    getProducts();
  }

  //helper functions - place other functions above this line
  function id(idName) {
    return document.getElementById(idName);
  }
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response.json();
  }
})();