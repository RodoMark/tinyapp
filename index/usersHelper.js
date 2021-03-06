const bcrypt = require("bcrypt");
const saltRounds = 10;

// EMAIL CHECKER FUNCTION
const emailExists = function (userDatabase, email) {
  for (const user in userDatabase) {
    if (userDatabase[user]["email"] === email) {
      return true;
    }
  }
  return false;
};

// PASSWORD CHECKER FUNCTION
const passwordMatch = function (incomingPassword, requestedPassword) {
  if (bcrypt.compareSync(incomingPassword, requestedPassword)) {
    return true;
  } else {
    return false;
  }
};

// USER FETCHER FUNCTION
const fetchUser = function (userDatabase, uniqueID) {
  if (userDatabase[uniqueID]) {
    return userDatabase[uniqueID];
  } else {
    return {};
  }
};

// USER FETCH BY EMAIL FUNCTION
const fetchUserByEmail = function (userDatabase, email) {
  for (const userID in userDatabase) {
    if (userDatabase[userID]["email"] === email) {
      //proper email
      return userDatabase[userID];
    }
  }

  // email doesn't exist
  return false;
};

// URL BASED ON USER FUNCTION
const urlsForUser = function (urlDatabase, uniqueID) {
  const urlSubset = {};

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL]["uniqueID"] === uniqueID) {
      urlSubset[shortURL] = {
        longURL: urlDatabase[shortURL]["longURL"],
        uniqueID,
      };
    }
  }
  return urlSubset;
};

// REGISTRATION ERROR FINDER FUNCTION
const registrationHelper = function (userDatabase, details) {
  let message = false;

  if (emailExists(userDatabase, details.incomingEmail)) {
    message = `User with the email ${details.incomingEmail} already exists. Please enter a different one.`;
  } else if (
    details.incomingEmail.length < 1
  ) {
    message = `One or more fields are empty`;
  } else if (!details.incomingEmail.includes("@")) {
    message = "Improperly formatted email address.";
  }

  return message;
};

// RANDOM LINKID FUNCTION
const generateRandomID = function () {
  return (+new Date()).toString(36).slice(-6);
};

// NEW USER FUNCTION
const addNewUser = function (details) {
  const newID = generateRandomID();

  newUser = {
    email: details.incomingEmail,
    password: bcrypt.hashSync(details.incomingPassword, saltRounds),
    id: `u${newID.slice(-4)}`,
  };

  return newUser;
};

module.exports = {
  addNewUser,
  emailExists,
  fetchUser,
  fetchUserByEmail,
  generateRandomID,
  passwordMatch,
  registrationHelper,
  urlsForUser,
};
