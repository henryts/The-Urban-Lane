const users = require("../models/user-schema");

//**********HOME PAGE RENDER*****/

exports.home = (req, res) => {
  res.render("index");
};
//****USER LOGIN POST*****
exports.loginUser = async (req, res) => {
  const mail = req.body.email;
  const userObj = await users.findOne({ email: mail });
  console.log(userObj);
  if (userObj == null) {
    return res.status(400).send("cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.password, userObj.password)) {
      res.render("index");
      //res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
    }
  } catch {
    //res.status(500).send();
    res.send("error");
  }
};

//********LOGIN PAGE RENDER**********
exports.loginPage = (req, res) => {
  res.render("user-login");
};
//********SIGNUP PAGE RENDER**********
exports.signupUser = (req, res) => {
  res.render("user-signup");
};
//********SIGNUP PAGE POST**********
exports.signupUser = async (req, res) => {
  const hashPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = new users({
    username: req.body.username,
    email: req.body.email,
    mobile: req.body.mobile,
    password: hashPassword,
  });
  newUser.save().then(() => console.log("data added to db successfully"));
};
