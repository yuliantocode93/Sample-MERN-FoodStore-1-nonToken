// Import necessary modules or models
const jwt = require("jsonwebtoken");
const config = require("../app/config");
// const UserActivation = require("../models/UserActivation"); // Assuming UserActivation is the model
const { getToken, policyFor } = require("../utils");
const User = require("../app/user/model");

// Assuming getToken is a function to extract the token from request headers

function decodeToken() {
  return async function (req, res, next) {
    try {
      let token = getToken(req);

      if (!token) return next();

      req.user = jwt.verify(token, config.secretkey);

      // Assuming User is the model to find a user by token
      let user = await User.findOne({ token: { $in: [token] } });

      if (!user) {
        return res.json({
          error: 1,
          message: "Token Expired",
        });
      }
    } catch (err) {
      if (err && err.name === "JsonWebTokenError") {
        return res.json({
          error: 1,
          message: err.message,
        });
      }

      return next(err);
    }

    return next();
  };
}

// Middleware to check user permissions - sample 1
function police_check(action, subject) {
  return function (req, res, next) {
    // Assuming policyFor checks user permissions based on req.user
    // You might implement a more sophisticated permission check here
    if (!req.user || !req.user.permissions || !req.user.permissions.includes(action)) {
      return res.status(403).json({
        error: 1,
        message: `You are not allowed to ${action} ${subject}`,
      });
    }
    next();
  };
}

module.exports = {
  decodeToken,
  police_check,
};
