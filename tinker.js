const belongsToUser = function (urlDatabase, uniqueID) {
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

console.log(belongsToUser(urlDatabase, "u0000"));
