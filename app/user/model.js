const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongoosepaginate = require("mongoose-paginate-v2");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcrypt");

let userSchema = Schema(
  {
    full_name: {
      type: String,
      required: [true, "Nama harus diisi"],
      maxlength: [255, "Panjang nama harus antara 3 - 255 karakter"],
      minlength: [3, "Panjang nama harus antara 3 - 255 karakter"],
    },

    customer_id: {
      type: Number,
    },

    email: {
      type: String,
      required: [true, "Email harus diisi"],
      maxlength: [255, "Panjang email maksimal 255 karakter"],

      unique: true,
      validate: [
        {
          validator: function (value) {
            const EMAIL_RE = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
            return EMAIL_RE.test(value);
          },
          message: (attr) => `${attr.value} harus merupakan email yang valid!`,
        },
        {
          validator: async function (value) {
            try {
              const UserModel = mongoose.model("User");
              const user = await UserModel.findOne({ email: value });
              return !user;
            } catch (err) {
              throw err;
            }
          },
          message: (attr) => `${attr.value} sudah terdaftar`,
        },
      ],
    },
    password: {
      type: String,
      required: [true, "Password harus diisi"],
      maxlength: [255, "Panjang password maksimal 255 karakter"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: [String],
  },
  { timestamps: true }
);

const HASH_ROUND = 10;
userSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, HASH_ROUND);
  next();
});

userSchema.plugin(AutoIncrement, { inc_field: "customer_id", disable_hooks: true });
userSchema.plugin(mongoosepaginate);

module.exports = model("User", userSchema);
