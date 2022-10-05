const express = require("express");
const app = express();
const PORT = 8080;
const morgan = require('morgan');
morgan(':method :url :status :res[content-length] - :response-time ms')
app.set("view engine", "ejs");
var cookieParser = require('cookie-parser')

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const userDatabase = {
  1: {
    id: 1,
    email: "tay@gmail.com",
    password: "1234"
  },
  2: {
    id: 2,
    email: "fake@fake.com",
    password: "pass"
  }
};

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(morgan('dev'))

function generateRandomString(n) {
  let randomString           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for ( let i = 0; i < n; i++ ) {
    randomString += characters.charAt(Math.floor(Math.random()*characters.length));
 }
 return randomString;
}

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id] 
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  let shortId = req.params.id
  const longURL = urlDatabase[shortId];
  const templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase 
  };
  res.redirect(longURL, templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], 
    urls: urlDatabase 
  };
  res.render("registration", templateVars)
})

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:id/update", (req, res) => {
  let id = req.params.id
  urlDatabase[id] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls") 
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newId = generateRandomString(6);
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`); 
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});