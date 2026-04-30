const { OAuth2Client } = require("google-auth-library");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// REGISTER
exports.userRegister = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(401).json("User already exists");
    }

    const newUser = new User({
      name,
      email,
      password,
      role: role || "user"
    });

    await newUser.save();
    res.status(200).json("Register Success");
  } catch (err) {
    res.status(500).json(err);
  }
};

// LOGIN
exports.userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(404).json("User not found");
    }

    if (existingUser.password !== password) {
      return res.status(401).json("Password mismatch");
    }

const token = jwt.sign(
  {
    email: existingUser.email,
    role: existingUser.role
  },
  process.env.JWT_KEY,
  { expiresIn: "1d" }
);


    res.status(200).json({
      message: "Login Success",
      existingUser,
      token
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  console.log("Credential received:", credential);

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, sub } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        password: sub, // dummy unique value
        role: "user",
      });

      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      existingUser: user,
    });

  } catch (err) {
    console.error(err);
    res.status(401).json("Invalid Google Token");
  }
};
