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
  belongsToUser,
  registrationHelper,
} = require("./usersHelper");

const userDatabase = {
  "mail@mail.com": {
    name: "Example Person",
    email: "mail@mail.com",
    password: "toyperson",
    uniqueID: "u0000",
  },

  "banana@bananas.com": {
    name: "A Banana",
    email: "banana@bananas.com",
    password: "IAMABANANA!",
    uniqueID: "u0001",
  },
};

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", uniqueID: "u0000" },
  c3xVn3: { longURL: "http://www.google.com", uniqueID: "u0001" },
};

// RANDOM NUMBER FUNCTION
const generateRandomLinkID = function () {
  return (+new Date()).toString(36).slice(-6);
};

// RANDOM USERID FUNCTION
const generateUserID = function () {
  return "u" + (+new Date()).toString(36).slice(-4);
};

// SERVER REQUESTS*********************************

// INDEX of all URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
    urls: belongsToUser(urlDatabase, req.cookies["user_id"]["uniqueID"]),
  };

  console.log(templateVars.user_id);

  console.log(templateVars.urls);

  res.render("urls_index", templateVars);
});

// LOGIN page
app.get("/login", (req, res) => {
  const templateVars = {
    user_id: req.cookies["user_id"],
  };

  if (req.cookies["user_id"]) {
    console.log(`${req.cookies["user_id"]} already logged in. Redirecting.`);
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
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

    const fetchedUser = fetchUser(userData, incomingEmail);

    res.cookie("user_id", {
      name: fetchedUser["name"],
      email: fetchedUser["email"],
      password: fetchedUser["password"],
      uniqueID: fetchedUser["uniqueID"],
    });
    res.redirect("/urls");
  } else if (
    emailExists(userDatabase, incomingEmail) &&
    !passwordMatch(userDatabase, incomingPassword)
  ) {
    res.status(400);
    res.send(`${incomingEmail} exists but password mismatch.`);
  } else {
    res.status(400);
    res.send(`User does not exist`);
    console.log();
    res.redirect("/login");
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id", req.body.email);
  res.redirect("/login");
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
    res.sendStatus(400);
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

  if (req.cookies["user_id"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Make NEW URL
app.post("/urls/", (req, res) => {
  const newKey = generateRandomLinkID();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    uniqueID: req.cookies["user_id"].uniqueID,
  };

  res.redirect("/urls");
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
