const getUserByEmail = (email, database) => {
  for (const userId in database) {
    const userFromDb = database[userId];

    if (userFromDb.email === email) {
      return userFromDb;
    }
  }

  return null;
};

const generateUId = () => {
  return Math.random().toString(36).substring(2, 6);
};

function generateRandomString(n) {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for ( let i = 0; i < n; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return randomString;
};

const urlsForUser = (id, database) => {
  let userURL = {}
  for (const shortUrl in database) {
    if (database[shortUrl].userId === id) {
      userURL[shortUrl] = database[shortUrl];
    }
  }
  return userURL;
};

module.exports = { 
  getUserByEmail,
  generateUId,
  generateRandomString,
  urlsForUser
};