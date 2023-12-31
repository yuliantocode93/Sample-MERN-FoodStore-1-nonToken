const { subject } = require("@casl/ability");
const { policyFor } = require("../../utils");
const DeliveryAddress = require("./model");

const store = async (req, res, next) => {
  try {
    let payload = req.body;
    let user = req.user;
    let address = await new DeliveryAddress({ ...payload, user: user._id });
    await address.save();
    return res.json(address);
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

const getAll = async (req, res, next) => {
  try {
    const user = req.user;
    const addresses = await DeliveryAddress.find({ user: user._id });
    return res.json(addresses);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    let { skip = 0, limit = 10 } = req.query;
    let count = await DeliveryAddress.find({ user: req.user._id }).countDocuments();
    let address = await DeliveryAddress.find({ user: req.user._id }).skip(parseInt(skip)).limit(parseInt(limit)).sort("-createdAt");

    return res.json({ data: address, count });
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
};

const updateById = async (req, res, next) => {
  try {
    let { _id, ...payload } = req.body;
    let { id } = req.params;
    let address = await DeliveryAddress.findById(id);
    let subjectAddress = subject("DeliveryAddress", { ...address, user_id: address.user });
    let policy = policyFor(req.user);
    if (!policy.can("update", subjectAddress)) {
      return res.json({
        error: 1,
        message: `you're not allowed to modify this resource`,
      });
    }

    address = await DeliveryAddress.findByIdAndUpdate(id, payload, { new: true });
    res.json(address);
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }
    next(err);
  }
};

const deleteById = async (req, res, next) => {
  try {
    let { id } = req.params;
    let address = await DeliveryAddress.findById(Id);
    let subjectAddress = subject("DeliveryAddress", { ...address, user_id: address.user });
    let policy = policyFor(req.user);
    if (!policy.can("delete", subjectAddress)) {
      return res.json({
        error: 1,
        message: `you're not allowed to delete to delete this resource`,
      });
    }

    address = await DeliveryAddress.findByIdDelete(id);
    res.json(address);
  } catch (err) {
    if (err && err.name == "ValidationError") {
      return res.json({
        error: 1,
        message: err.message,
        fields: err.errors,
      });
    }

    next(err);
  }
};

module.exports = {
  store,
  getAll,
  getById,
  updateById,
  deleteById,
};
