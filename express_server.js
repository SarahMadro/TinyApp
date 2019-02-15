var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')
app.use(cookieParser())

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

function generateRandomString() {
  let r = Math.random().toString(36).substring(7);
  console.log(r);
  return r;
};

  //registration error handler
  function isEmailTaken(email) {
    for (let key in users) {
      let user = users[key];
      if (user.email === email) {
        return user;
      }
    }
    return false;
  };
  // checks/ compares password and email
  function passwordMatch(password, email) {
    for(let key in users) {
      if (users[key].email === email && users[key].password === passowrd) {
        return users[key];
      }
    }
    return false;
  }

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  let randomStr = generateRandomString(7);
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(`/urls/${randomStr}`);

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls/");
});

//may need fixing
app.post('/login', (req, res) => {
  let user_id = req.body.user_id;
  let user = isEmailTaken(req.body.email);
  if (!user) {
    res.status(400).send("<p>Not a Registered Username</p><a href='/login'>Go Back</a>");
  } else if (req.body.password !== user.password) {
    res.status(400).send("<p>Incorrect Password</p><a href = '/login'>Go Back</a>");
  } else {
    req.cookies.user_id = ('user_id', user);
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.get('/register', (req, res) => {
  let templateVars = {
    user: ''
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  let newId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if(req.body.email === '' && req.body.password === ''){
      res.status(400).send("<p>'Please fill out the feilds.'</p><a href='/register'>Go Back</a>");
  } else if(isEmailTaken(req.body.email)) {
    res.status(400).send("<p>'Sorry, this username is taken, please try again with another.'</p><a href='/login'>Go Back</a>");

  } else {
      users[newId] = {
        id: newId,
        email: email,
        password: password
      }
      res.cookie('user_id', newId);
      res.redirect('/urls');
  };
});

app.get('/login', (req, res) => {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
  res.render('login', templateVars);
});