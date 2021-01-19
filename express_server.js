"use strict";

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// RANDOM NUMBER FUNCTION
const generateRandomString = function () {
  return (+new Date()).toString(36).slice(-6);
};

// SERVER REQUESTS

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// ALL URLS
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// NEW URLS
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// FIND URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };

  let short = templateVars.shortURL;
  let long = templateVars.longURL;

  for (const shortURL of urlDatabase) {
    if (shortURL === short) {
      res.render("urls_show", templateVars);
    } else {
      res.redirect("404_page");
    }
  }
});

app.post("/urls/", (req, res) => {
  console.log("Ok");
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  console.log(newKey);
  console.log(urlDatabase[newKey]);

  const templateVars = {
    shortURL: newKey,
    longURL: urlDatabase[newKey],
  };

  // Redirect to show URLS page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
