GET /urls - if user is not logged in: returns HTML with a relevant error message -> user is redirected to /login instead ✅

GET /urls/new - if user is not logged in: redirects to the /login page -> throws error "TypeError: Cannot read property 'id' of undefined" ✅

POST /register - users should be able to register without needing to also input a name (should be optional). Password does not need to be limited to min 6 chars, if the user inputs less than 6 it shows an ugly error which doesn't inform the user what went wrong: "ReferenceError: errorMessage is not defined" ✅

POST /login - if email and password params match an existing user: sets a cookie redirects to /urls -> login doesn't work, just redirects me to the /login page ✅

POST /urls if user is logged in: redirects to /urls/:id, where :id matches the ID of the newly saved URL -> user is redirected to /urls instead ✅

POST /urls if user is not logged in: (Minor) returns HTML with a relevant error message -> any user is able to post to this url even if they are not logged in ✅

GET /u/:id if URL for the given ID exists: redirects to the corresponding long URL -> redirects user to /u/:id instead of the actual url ✅

usersHelpers.js can be located in a subfolder as we want to only keep key files in the root directory ✅

usersHelpers.js 62 - it is more readable and maintainable to return a string corresponding to the error type rather than an integer. In the latter case you are making up your own corresponding code which no one except yourself will be able to understand at a glance vs a string that says "email length error" ✅

no need to have a separate rejectRequest helper function, these rejections can be called directly in the route ✅

generateLinkId & generateUserID -> you could just use one of these for both use cases ✅
