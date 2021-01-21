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

const userDatabase = {};

const urlDatabase = {};

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
// app.use(methodOverride());

// COOKIE SESSION MODULE
const cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());

// BODY PARSER MODULE
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

// // MORGAN MODULE
// const morgan = require("morgan");
// app.use(morgan("short"));

// const currentUser = (req, res, next) => {
//   const user = userDatabase[req.session["user_id"]];
//   req.currentUser = user;
//   next();
// };

// app.use(currentUser);

// SERVER REQUESTS*********************************

app.get("/users", (req, res) => {
  res.send(JSON.stringify(userDatabase));
});

// INDEX of all urls
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const userInfo = fetchUser(userDatabase, user_id);

  const templateVars = {
    urls: {},
    loginRequiredMessage: "",
    userInfo,
  };

  if (user_id) {
    templateVars.userInfo = userInfo;
    templateVars.urls = urlsForUser(urlDatabase, user_id["uniqueID"]);
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

  if (req.session.user_id) {
    console.log(`${req.session.user_id} already logged in. Redirecting.`);
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
  console.log("incomingEmail: ", incomingEmail);
  const incomingPassword = req.body.password;
  console.log("incomingPassword: ", incomingPassword);
  console.log("user", userDatabase[incomingEmail]);
  console.log("fetchedUser: ", fetchUser(userDatabase, incomingEmail));

  if (emailExists(userDatabase, incomingEmail)) {
    // email for user exists
    const fetchedUser = fetchUserByEmail(userDatabase, incomingEmail);
    const requestedPassword = fetchedUser.password;

    if (passwordMatch(incomingPassword, requestedPassword)) {
      console.log(`${incomingEmail} exists and password is matching.`);

      // this is the authentication that's passed to the user
      req.session.user_id = fetchedUser["uniqueID"];
      console.log("req.session.user_id", req.session.user_id);
      res.redirect("/urls");
    } else {
      res.status(400);
      res.send(`${incomingEmail} exists but password mismatch.`);
    }
  } else {
    // email cannot be found
    res.status(400);
    res.send(`User does not exist`);
    console.log();
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
    const generatedUser = addNewUser(details);

    userDatabase[generatedUser.uniqueID] = generatedUser;
    console.log(addNewUser(details));
    console.log(
      `New user registered:\n ${userDatabase[generatedUser.uniqueID]}`
    );
    res.redirect("/urls");
  }
});

// ADD new url
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const userInfo = fetchUser(userDatabase, user_id);

  const templateVars = {
    userInfo,
  };

  if (req.session.user_id) {
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
    uniqueID: req.session["user_id"]["uniqueID"],
  };

  console.log(`New URL created ${JSON.stringify(urlDatabase[newKey])}`);

  res.redirect("/urls");
});

// FIND url
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const userInfo = fetchUser(userDatabase, user_id);

  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    userInfo,
  };

  res.render("urls_show", templateVars);
});

// DELETE existing URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  const userInfo = fetchUser(userDatabase, user_id);

  const requestKey = req.params.shortURL;

  if (userInfo["uniqueID"] === urlDatabase[requestKey]["uniqueID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    rejectRequest(res);
  }
});

// UPDATE existing URL
app.post("/urls/:shortURL/update", (req, res) => {
  const user_id = req.session.user_id;
  const userInfo = fetchUser(userDatabase, user_id);

  const requestKey = req.params.shortURL;

  if (
    userInfo &&
    userInfo["uniqueID"] === urlDatabase[requestKey]["uniqueID"]
  ) {
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
