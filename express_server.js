"use strict";

const morgan = require("morgan");

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

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

// INDEX of all URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

// SET USERNAME
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// adding NEW URLS
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// FIND URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
  };

  let short = templateVars.shortURL;
  let long = templateVars.longURL;

  res.render("urls_show", templateVars);
});

// Make NEW URL
app.post("/urls/", (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;

  const templateVars = {
    shortURL: newKey,
    longURL: urlDatabase[newKey],
    username: req.cookies["username"],
  };

  res.redirect("/urls");
});

// DELETE existing URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
});

// UPDATE existing URL
app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
