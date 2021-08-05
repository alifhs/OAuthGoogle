const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const dotenv = require("dotenv");

// get config vars
dotenv.config();

const client = new OAuth2Client(process.env.CLIENTID);

console.log(process.env.SECRET);

const app = express();

const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 5000;

function generateAccessToken(email) {
  return jwt.sign(email, process.env.secret, { expiresIn: "1800s" });
}

app.use(express.json());

app.use(cookieParser());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", (req, res) => {
  let token = req.body.token;
  const email = req.body.email;

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    return payload;
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
  }
  verify()
    .then((result) => {
      console.log(result);
      const tokens = generateAccessToken({ email: req.body.email });
      // res.json(t);

    //   res.send(tokens);
        res.cookie('session-token', tokens);
        res.send(req.body.email);
    })
    .catch(console.error);
//   console.log(email);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/dashboard", (req, res) => {

  console.log(req.cookies['session-token']);

  jwt.verify(req.cookies['session-token'], process.env.SECRET , (err, user) => {
    console.log(err)

    if (err) return res.sendStatus(403)

    // req.user = user
    console.log(user)
    res.render("dashboard");
  })

});

app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});
