const User = require("../user/model");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { getToken } = require("../../utils");

const register = async (req, res, next) => {
  try {
    const payload = req.body;
    let user = new User(payload);
    await user.save();
    return res.json(user);
  } catch (err) {
    if (err && err.name === "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const localStrategy = async (email, password, done) => {
  try {
    let user = await User.findOne({ email }).select("-__v -createdSt -updatedAt -cart_items -token");
    if (!user) return done();
    if (bcrypt.compareSync(password, user.password)) {
      const { password: userPassword, ...userWithoutPassword } = user.toJSON();
      return done(null, userWithoutPassword);
    }
  } catch (err) {
    done(err, null);
  }
  done();
};

const login = async (req, res, next) => {
  passport.authenticate("local", async function (err, user) {
    if (err) return next(err);

    if (!user) return res.json({ error: 1, message: "Email or Password incorrect" });

    let signed = jwt.sign(user, config.secretkey);

    await User.findByIdAndUpdate(user._id, { $push: { token: signed } });

    res.json({
      message: "Login Successfully",
      user,
      token: signed,
    });
  })(req, res, next);
};

const logout = async (req, res, next) => {
  try {
    const token = getToken(req);

    let user = await User.findOneAndUpdate({ token: { $in: [token] } }, { $pull: { token: token } }, { useFindAndModify: false });

    if (!token || !user) {
      return res.json({
        error: 1,
        message: "No User Found or Invalid Token",
      });
    }

    return res.json({
      error: 0,
      message: "Logout berhasil",
    });
  } catch (err) {
    return next(err);
  }
};

const me = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      err: 1,
      message: "Unauthorized: You're not logged in or the token has expired",
    });
  }

  // If the user is authenticated, return user information
  res.json(req.user);
};

module.exports = {
  register,
  localStrategy,
  login,
  logout,
  me,
};
