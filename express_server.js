"use strict";

// DRIVER CODE FOR USER FEATURES *********************************
const {
  addNewUser,
  emailExists,
  fetchUser,
  fetchUserByEmail,
  generateRandomID,
  passwordMatch,
  registrationHelper,
  rejectRequest,
  urlsForUser,
} = require("./index/usersHelper");

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
    longURL: "www.google.com",
    uniqueID: "u0000",
  },

  cd52l: {
    longURL: "www.example.com",
    uniqueID: "u0001",
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

// SERVER REQUESTS *********************************

app.get("/users", (req, res) => {
  res.send(JSON.stringify(userDatabase));
});

// ROOT redirects to login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// INDEX of all urls
app.get("/urls", (req, res) => {
  if (req.session.user) {
    const templateVars = {
      userInfo: req.session.user,
      urls: urlsForUser(urlDatabase, req.session.user.id),
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(400);
    res.send("Please log in to see your links");
  }
});

// LOGIN page
app.get("/login", (req, res) => {
  // Check if the user has authentication
  if (!req.session.user) {
    const templateVars = {
      userInfo: { name: "" },
      usernameMessage: "",
    };
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
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
      console.log("fetchedUser", fetchedUser);
      // this is the authentication that's passed to the user
      req.session.user = fetchedUser;
      res.redirect("/urls");
    } else {
      res.status(400);
      res.send(`${incomingEmail} exists but password mismatch.`);
    }
  } else {
    // email cannot be found
    res.status(400);
    res.send(`User does not exist`);
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
  let incomingName = req.body.name.length > 0 ? req.body.name : "anonymous";
  // User details for registration
  const details = {
    incomingName,
    incomingEmail: req.body.email,
    incomingPassword: req.body.password,
  };

  let regFail = registrationHelper(userDatabase, details);

  if (regFail) {
    res.status(400);
    res.send(regFail);
  } else {
    req.session.user = addNewUser(details);
    const user = req.session.user;
    userDatabase[user.id] = user;
    res.redirect("/login");
  }
});

// ADD new url
app.get("/urls/new", (req, res) => {
  if (req.session.user === undefined || !req.session.user) {
    res.redirect("/login");
  } else {
    const user_id = req.session.user.id;
    const userInfo = fetchUser(userDatabase, user_id);

    const templateVars = {
      userInfo,
    };

    res.render("urls_new", templateVars);
  }
});

// GENERATE new url
app.post("/urls/", (req, res) => {
  const newKey = generateRandomID();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    uniqueID: req.session.user.id,
  };

  res.redirect("/urls");
});

// FIND url
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];

    res.redirect(longURL);
  } else {
    res.status(400);
    res.send("ShortURL with that ID does not exist");
  }
});

app.post("/u/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]["longURL"];
  if (urlDatabase[shortURL]) {
    if (req.session.user) {
      if (req.session.user.id === urlDatabase[shortURL]["uniqueID"]) {
        const user_id = req.session.user.id;
        const userInfo = fetchUser(userDatabase, user_id);

        const templateVars = {
          userInfo,
          shortURL,
          longURL,
        };

        res.render("urls_show", templateVars);
      } else {
        rejectRequest(res);
      }
    }
  } else {
    res.status(400);
    res.send("ShortURL with that ID does not exist");
  }
});

// DELETE existing URL
app.delete("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL]) {
    if (req.session.user) {
      const user_id = req.session.user.id;
      const userInfo = req.session.user;
      const requestKey = req.params.shortURL;

      if (userInfo["uniqueID"] === urlDatabase[requestKey][user_id]) {
        delete urlDatabase[req.params.shortURL];
        res.redirect("/urls");
      } else {
        rejectRequest(res);
      }
    }
  } else {
    res.status(400);
    res.send("ShortURL with that ID does not exist");
  }
});

// UPDATE existing URL
app.put("/u/:shortURL", (req, res) => {
  if (req.session.user) {
    const user_id = req.session.user.id;
    const userInfo = req.session.user;
    const requestKey = req.params.shortURL;

    if (userInfo && user_id === urlDatabase[requestKey]["uniqueID"]) {
      urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
      res.redirect("/urls");
    }
  } else {
    rejectRequest(res);
  }
});

// LISTENER
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

module.exports = {
  userDatabase,
};
