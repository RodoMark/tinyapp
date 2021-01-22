const urlsForUser = function (urlDatabase, uniqueID) {
  const urlSubset = {};

  for (const shortURL in urlDatabase) {
    console.log(shortURL);
    if (urlDatabase[shortURL]["uniqueID"] === uniqueID) {
      urlSubset[shortURL] = {
        longURL: urlDatabase[shortURL]["longURL"],
        uniqueID,
      };
    }
  }
  return urlSubset;
};

const urlDatabase = {
  b2xVn2: { longURL: "http://www.lighthouselabs.ca", uniqueID: "u0000" },
  c3xVn3: { longURL: "http://www.google.com", uniqueID: "u0001" },
};

const userDatabase = {
  u0000: {
    name: "example",
    email: "example@mail.com",
    password: "password",
    uniqueID: "u0000",
  },
};

const fetchUser = function (userDatabase, uniqueID) {
  if (userDatabase[uniqueID]["uniqueID"] === uniqueID) {
    return userDatabase[uniqueID];
  } else {
    return false;
  }
};

console.log(urlsForUser(urlDatabase, "u0001"));
