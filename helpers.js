
const getUserByEmail = (emailToFind, usersDatabase) => {
  for (const userKey in usersDatabase) {
    //console.log("userKey:", userKey);
    //object.key//this is I grab the value of an object
    //object[key]//this is I grab the value of an object
    const currentUser = usersDatabase[userKey]; // this gets the user values
    //console.log("CURRENT USER:", currentUser);
    //console.log("USER EMAIL TO FIND:", emailToFind);
    if (currentUser.email === emailToFind) {
      return currentUser;
    }
  }
  return undefined;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

const urlsForUser = (id, database) => {
  let userUrls = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }

  return userUrls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };