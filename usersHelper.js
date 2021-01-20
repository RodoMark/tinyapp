const emailExists = function (userDatabase, email) {
  if (userDatabase[email]) {
    return true;
  } else {
    return false;
  }
};

const checkPassword = function (userDatabase, email, password) {
  if (userDatabase[email].password === password) {
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

module.exports = {
  emailExists,
  checkPassword,
  fetchUser,
};
