import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import getUploader from "../middleware/uploadMiddleware.js";

const upload = getUploader("profilePics");
const router = express.Router();
// SIGNUP

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup",upload.single("uploads"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const profilePicPath = req.file ? "/uploads/" + req.file.filename : "";

    // create user

    const user = new User({
      name,
      email,
      password: hashedPassword,
      ProfilePic: profilePicPath
    });

    await user.save();
    res.redirect("/");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SIGNIN

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });

    res.redirect("/");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/logout", (req, res) => {
  res.clearCookie("token");
  req.flash("success", "Logged out successfully");
  res.redirect("/");
});

export default router;
