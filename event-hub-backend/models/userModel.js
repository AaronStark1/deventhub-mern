const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // bcrypt hash. Absent for accounts created through Google sign-in.
  // `select: false` keeps it out of every query unless asked for explicitly.
  password: {
    type: String,
    select: false,
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  role: {
    type: String,
    enum: ["user", "host"],
    default: "user",
  },
});

// Safety net: the hash never reaches a JSON response, whatever a controller returns.
userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("users", userSchema);
