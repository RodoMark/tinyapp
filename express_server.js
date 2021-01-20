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

const {
  emailExists,
  passwordMatch,
  fetchUser,
  registrationHelper,
} = require("./usersHelper");

const userDatabase = {
  "mail@mail.com": {
    name: "Example Person",
    email: "mail@mail.com",
    password: "toyperson",
  },

  "banana@bananas.com": {
    name: "A Banana",
    email: "banana@bananas.com",
    password: "IAMABANANA!",
  },
};

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
};

// RANDOM NUMBER FUNCTION
const generateRandomString = function () {
  return (+new Date()).toString(36).slice(-6);
};

// SERVER REQUESTS*********************************

// INDEX of all URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"],
  };

  res.render("urls_index", templateVars);
});

// LOGIN page
app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    console.log(`${req.cookies["user_id"]} already logged in. Redirecting.`);
    res.redirect("/urls");
  }

  const templateVars = {
    user_id: req.cookies["user_id"],
  };

  res.render("login", templateVars);
});

// LOGGING INTO THE SITE
app.post("/login", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;
  console.log(incomingEmail, incomingPassword);

  if (
    emailExists(userDatabase, incomingEmail) &&
    passwordMatch(userDatabase, incomingEmail, incomingPassword)
  ) {
    console.log(`${incomingEmail} exists and password is matching.`);
    res.cookie("user_id", {
      name: fetchUser(userDatabase, incomingEmail)["name"],
      email: incomingEmail,
      password: incomingPassword,
    });
    res.redirect("/urls");
  } else if (
    emailExists(userDatabase, incomingEmail) &&
    !passwordMatch(userDatabase, incomingPassword)
  ) {
    console.log(`${incomingEmail} exists but password mismatch.`);
    res.redirect("/login");
  } else {
    console.log(`User does not exist`);
    res.redirect("/login");
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.email);
  res.redirect("/urls");
});

// REGISTER a new account

app.get("/register", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
  };

  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const details = {
    incomingName: req.body.name,
    incomingEmail: req.body.email,
    incomingPassword: req.body.password,
  };

  const errorMessages = {
    usernameMessage: `User with the email ${details.incomingEmail} already exists. Please enter a different one.`,
    emptyMessage: `One or more fields are empty`,
    emailMessage: "Improperly formatted email address.",
    passwordMessage: "Password must be minimum of 6 characters.",
  };

  let regCheck = registrationHelper(userDatabase, details);

  if (regCheck !== 0) {
    res.status(400);
    if (regCheck === 1) {
      res.send(errorMessages.usernameMessage);
    } else if (regCheck === 2) {
      res.send(errorMessages.emptyMessage);
    } else if (regCheck === 3) {
      res.send(errorMessages.emailMessage);
    } else if (regCheck === 4) {
      res.send(errorMessage.passwordMessage);
    }
  } else {
    userDatabase[incomingEmail] = {
      name: details.incomingName,
      email: details.incomingEmail,
      password: details.incomingPassword,
    };
    res.redirect("/urls");
  }
});

// adding NEW URLS
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
  };

  res.render("urls_new", templateVars);
});

// FIND URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies["user_id"],
  };

  res.render("urls_show", templateVars);
});

// Make NEW URL
app.post("/urls/", (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;

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
  console.log(`TinyApp listening on port ${PORT}!`);
});
