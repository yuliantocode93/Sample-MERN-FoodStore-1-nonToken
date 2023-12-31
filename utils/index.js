const { AbilityBuilder, Ability } = require("@casl/ability");

function getToken(req) {
  let token = null;

  if (req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer", "").trim();
  }

  return token && token.length ? token : null;
}

const policies = {
  guest(user, { can }) {
    can("read", "Product");
  },
  user(user, { can }) {
    can("view", "Order");
    can("create", "Product");
    can("create", "Order");
    can("read", "Order", { user_id: user._id });
    can("update", "User", { _id: user._id });
    can("view", "DeliveryAddress");
    can("create", "DeliveryAddress", { user_id: user._id });
    can("update", "DeliveryAddress", { user_id: user._id });
    can("delete", "DeliveryAddress", { user_id: user._id });
    can("read", "Invoice", { user_id: user._id });
  },
  admin(user, { can }) {
    can("message", "all");
  },
};

const policyFor = (user) => {
  const builder = new AbilityBuilder();

  if (user && typeof policies[user.role] === "function") {
    policies[user.role](user, builder);
  } else {
    // If user role is not recognized, provide default guest permissions
    policies["guest"](user, builder);
  }

  return new Ability(builder.rules);
};

module.exports = {
  getToken,
  policyFor,
};
