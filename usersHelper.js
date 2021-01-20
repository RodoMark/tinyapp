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

module.exports = {
  emailExists,
  passwordMatch,
  fetchUser,
  registrationHelper,
};