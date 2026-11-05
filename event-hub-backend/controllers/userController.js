const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const ROLES = ["user", "host"];
const SALT_ROUNDS = 10;
const INVALID_CREDENTIALS = "Invalid email or password";

// A real bcrypt hash (cost 10) of a throwaway string. Compared against when
// the email is unknown, so a miss costs the same time as a hit and the
// response doesn't reveal whether the account exists. Pre-computed because
// hashSync at startup would block the event loop for ~100 ms.
const DUMMY_HASH = "$2b$10$gjvGSjEBkDZNnfQRxnuWJuJEJ8VaQHnMJjVCQ2x8KabAKCje/M.Zy";

const isBcryptHash = (value) =>
  typeof value === "string" && /^\$2[aby]\$/.test(value);

// The pre-bcrypt Google login stored the Google account id (a long digit
// string) as `password`. That was never a credential and must not become one.
const looksLikeGoogleSub = (value) => /^\d{15,}$/.test(value);

// One canonical form so "Ann@Example.com" and "ann@example.com" are the same
// account, and ownership checks keyed on the JWT email line up.
const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const signToken = (user) =>
  jwt.sign({ email: user.email, role: user.role }, process.env.JWT_KEY, {
    expiresIn: "1d",
  });

// Only what the client needs — never the password hash.
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// True when `password` matches the stored credential. Accounts created before
// hashing was introduced hold a plaintext password; those are upgraded to a
// bcrypt hash on their first successful login, so nobody is locked out.
const verifyPassword = async (user, password) => {
  if (!user?.password || looksLikeGoogleSub(user.password)) {
    await bcrypt.compare(password, DUMMY_HASH);
    return false;
  }

  if (isBcryptHash(user.password)) {
    return bcrypt.compare(password, user.password);
  }

  // Legacy plaintext record: accept once, then store a hash.
  if (user.password !== password) return false;
  user.password = await bcrypt.hash(password, SALT_ROUNDS);
  await user.save();
  return true;
};

// REGISTER
exports.userRegister = async (req, res) => {
  const { name, password, role = "user" } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!name || !email || typeof password !== "string" || !password) {
    return res.status(400).json("Name, email and password are required");
  }
  if (!ROLES.includes(role)) {
    return res.status(400).json("Invalid role");
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await User.create({
      name,
      email,
      password: passwordHash,
      role,
      authProvider: "local",
    });

    res.status(201).json("Register Success");
  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};

// LOGIN
exports.userLogin = async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);

  if (!email || typeof password !== "string" || !password) {
    return res.status(400).json("Email and password are required");
  }

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!(await verifyPassword(user, password))) {
      return res.status(401).json(INVALID_CREDENTIALS);
    }

    res.status(200).json({
      message: "Login Success",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};

// GOOGLE LOGIN
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json("Missing Google credential");
  }

  // Only a verification failure is the client's fault.
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json("Invalid Google Token");
  }

  const email = normalizeEmail(payload.email);
  if (!payload.email_verified || !email) {
    return res.status(401).json("Google account email is not verified");
  }

  try {
    const findOrCreate = () =>
      User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            name: payload.name || email.split("@")[0],
            email,
            role: "user",
            authProvider: "google",
          },
        },
        { new: true, upsert: true }
      ).select("+password");

    let user;
    try {
      user = await findOrCreate();
    } catch (err) {
      // Two first-time sign-ins racing: the loser's insert hits the unique
      // email index, but the row now exists, so a second look finds it.
      if (err.code !== 11000) throw err;
      user = await findOrCreate();
    }

    // Migrate a legacy record that still holds the Google sub as a password.
    if (user.password && looksLikeGoogleSub(user.password)) {
      user.password = undefined;
      user.authProvider = "google";
      await user.save();
    }

    res.status(200).json({
      message: "Login Success",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json("Server Error: " + err.message);
  }
};
