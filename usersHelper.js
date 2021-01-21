const emailExists = function (userDatabase, email) {
  if (userDatabase[email]) {
    return true;
  } else {
    return false;
  }
};

const passwordMatch = function (userDatabase, email, password) {
  if (userDatabase[email]["password"] === password) {
    return true;
  } else {
    return false;
  }
};

const fetchUser = function (userDatabase, email) {
  if (userDatabase[email]) {
    return userDatabase[email];
  } else {
    return {};
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

const rejectUser = function (cookies, requestKey, callback) {
  res.sendStatus(400);
  res.send("Invalid authorization");
};

module.exports = {
  emailExists,
  passwordMatch,
  fetchUser,
  urlsForUser,
  registrationHelper,
  urlsForUser,
  rejectUser,
};
