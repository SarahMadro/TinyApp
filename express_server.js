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
// filters through database comparing userid w logged in id
  function urlsId(id) {
   console.log('id',id)
    let obj = {};
    for (const key in urlDatabase) {
      console.log('$$$$$', urlDatabase[key]);
      if (urlDatabase[key].userID === id) {
        obj[key] = urlDatabase[key];
      }
    }

    return obj;
  }

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "userRandomID" },
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

// if not a user or logged in they cant create new urls
app.get("/urls/new", (req, res) => {
  let user = users[req.cookies["user_id"]]
  let userID = req.cookies["user_id"]; ///removed user[];

  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    urls: urlsId(userID)
  };
  if (!user) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars); //changed from index to new
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const userID = users[req.cookies["user_id"]]
  //const userExists = urlDatabase[req.params.shortURL].userId === req.cookies.userId
  if (userID) {
    let templateVars = {
      userID: req.cookies.userID,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: userID
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("<p>Not Authorized</p><a href='/login'>Login</a>");
  }
});
//filter through
app.get('/urls', (req, res) => {
  // if (urlDatabase[req.params.shortURL].userID === req.cookies.userID);
  let user = users[req.cookies["user_id"]];
  if (user) {
    let userID = req.cookies["user_id"]; ///removed user[];
    let templateVars = {
      urls: urlsId(userID),
      users: urlDatabase,
      user
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }

});

app.post("/urls", (req, res) => {
  let randomStr = generateRandomString(7);
  let user = users[req.cookies["user_id"]]
  if (!user) {
    res.status(400).send("<p>Not Authorized</p><a href='/login'>Login</a>");
    res.redirect('/login');
  } else {
    let urlObj = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
     urlDatabase[randomStr] = urlObj;
     res.redirect(`/urls`);
  }
});

app.get("/u/:shortURL", (req, res) => {
let longURL = urlDatabase[req.params.shortURL].longURL
// let user = users[req.cookies["user_id"]]
//   if(user || !user)
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  let user = users[req.cookies["user_id"]]
  if (!user) {
    res.status(400).send("<p>Not Authorized</p><a href='/login'>Login</a>");
    res.redirect('/login');
  } else {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
  }

});

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
      let urlObj = {
        longURL: req.body.longURL,
        userID: req.cookies["user_id"]
      };
  urlDatabase[shortURL] = urlObj;
  res.redirect("/urls/");
});

app.post('/login', (req, res) => {
  let user = isEmailTaken(req.body.email);
  if (!user) {
    res.status(400).send("<p>Not a Registered Username</p><a href='/login'>Go Back</a>");
  } else if (req.body.password !== user.password) {
    res.status(400).send("<p>Incorrect Password</p><a href = '/login'>Go Back</a>");
  } else {
    res.cookie('user_id',user.id);
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
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
      res.cookie('email', email);
      res.redirect('/urls');
  };
});

app.get('/login', (req, res) => {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
  res.render('login', templateVars);
});