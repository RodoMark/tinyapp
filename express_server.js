"use strict";

// DRIVER CODE FOR USER FEATURES*********************************
const {
  addNewUser,
  emailExists,
  fetchUser,
  fetchUserByEmail,
  generateLinkID,
  generateUserID,
  passwordMatch,
  registrationHelper,
  rejectRequest,
  urlsForUser,
} = require("./usersHelper");

const userDatabase = {
  sample: {
    name: "example",
    email: "example@mail.com",
    password: "password",
    uniqueID: "u0000",
  },
};

const urlDatabase = {
  exampl: {
    longURL: "www.example.com",
    uniqueID: "u0000",
  },
};

// DEPENDENCIES *****************************************

// EXPRESS MODULE
const express = require("express");
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");

// ENCRYPTION MODULE
const bcrypt = require("bcrypt");

// METHOD OVERRIDE MODULE
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// COOKIE SESSION MODULE
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

// BODY PARSER MODULE
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// SERVER REQUESTS*********************************

app.get("/", (req, res) => {
  res.redirect("/login");
});

// INDEX of all urls
app.get("/urls", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  }

  const templateVars = {};

  if (req.session.user) {
    const templateVars = {
      userInfo: req.session.user,
      urls: urlsForUser(urlDatabase, req.session.user.id),
    };
    res.render("urls_index", templateVars);
  } else {
    templateVars.loginRequiredMessage = "Please log in to see your links";
    res.render("login", templateVars);
  }
});

// LOGIN page
app.get("/login", (req, res) => {
  const templateVars = {
    loginRequiredMessage: "",
    userInfo: {},
    usernameMessage: "",
  };

  if (req.session.user) {
    res.redirect("/urls");
  } else if (req.headers["sec-fetch-site"] === "same-origin") {
    templateVars.loginRequiredMessage = "Please log in to see your links";
    res.render("login", templateVars);
  } else {
    templateVars.loginRequiredmessage = "";
    res.render("login", templateVars);
  }
});

// LOG IN to the site
app.post("/login", (req, res) => {
  const incomingEmail = req.body.email;
  const incomingPassword = req.body.password;

  if (emailExists(userDatabase, incomingEmail)) {
    // email for user exists
    const fetchedUser = fetchUserByEmail(userDatabase, incomingEmail);
    const requestedPassword = fetchedUser.password;

    if (passwordMatch(incomingPassword, requestedPassword)) {
      // this is the authentication that's passed to the user
      req.session.user = fetchedUser["uniqueID"];
      res.redirect("/urls");
    } else {
      res.status(400);
      res.send(`${incomingEmail} exists but password mismatch.`);
    }
  } else {
    // email cannot be found
    res.status(400);
    res.send(`User does not exist`);
    res.redirect("/login");
  }
});

// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// REGISTER new account
app.get("/register", (req, res) => {
  const templateVars = {
    userInfo: {},
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
    req.session.user = addNewUser(details);
    const user = req.session.user;
    userDatabase[user.id] = user;
    res.redirect("/login");
  }
});

// ADD new url
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user.id;
  const userInfo = fetchUser(userDatabase, user_id);

  const templateVars = {
    userInfo,
  };

  if (req.session.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// GENERATE new url
app.post("/urls/", (req, res) => {
  const newKey = generateLinkID();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    uniqueID: req.session.user.id,
  };

  res.redirect("/urls");
});

// FIND url
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    userInfo: { name: "" },
  };

  res.render("urls_show", templateVars);
});

// DELETE existing URL
app.delete("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user.id;

  const userInfo = req.session.user;

  const requestKey = req.params.shortURL;

  if (userInfo["uniqueID"] === urlDatabase[requestKey][user_id]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    rejectRequest(res);
  }
});

// UPDATE existing URL
app.put("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user.id;
  const userInfo = req.session.user;

  const requestKey = req.params.shortURL;

  if (userInfo && user_id === urlDatabase[requestKey]["uniqueID"]) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    rejectRequest(res);
  }
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

module.exports = {
  userDatabase,
};
