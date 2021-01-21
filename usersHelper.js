const { userDatabase, urlDatabase } = require("./express_server.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const emailExists = function (userDatabase, email) {
  if (userDatabase[email]) {
    return true;
  } else {
    return false;
  }
};

const passwordMatch = function (incomingPassword, requestedPassword) {
  if (bcrypt.compareSync(incomingPassword, requestedPassword)) {
    return true;
  } else {
    return false;
  }
};

const fetchUser = function (userDatabase, email) {
  if (userDatabase[email]) {
    return userDatabase[email];
  } else {
    return false;
  }
};

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

const registrationHelper = function (userDatabase, details) {
  if (emailExists(userDatabase, details.incomingEmail)) {
    return 1;
  } else if (
    details.incomingName.length < 1 ||
    details.incomingEmail.length < 1 ||
    details.incomingName.length < 1 === 2
  ) {
    return 2;
  } else if (!details.incomingEmail.includes("@")) {
    return 3;
  } else if (details.incomingPassword.length < 6) {
    return 4;
  } else {
    return 0;
  }
};

// RANDOM LINKID FUNCTION
const generateLinkID = function () {
  return (+new Date()).toString(36).slice(-6);
};

// RANDOM USERID FUNCTION
const generateUserID = function () {
  return "u" + (+new Date()).toString(36).slice(-4);
};

// NEW USER FUNCTION
const addNewUser = function (details) {
  console.log(details.incomingName);
  const newID = generateUserID();

  newUser = {
    name: details.incomingName,
    email: details.incomingEmail,
    password: bcrypt.hashSync(details.incomingPassword, saltRounds),
    uniqueID: newID,
  };

  return newUser;
};

const rejectRequest = function (res) {
  return res.status(401).json({
    message: "Unauthorized Request",
  });
};

module.exports = {
  addNewUser,
  emailExists,
  fetchUser,
  generateLinkID,
  generateUserID,
  passwordMatch,
  registrationHelper,
  urlsForUser,
  rejectRequest,
};
