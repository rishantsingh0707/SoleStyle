dotenv.config();
import express from 'express';
import { checkForAuthenticationCookies } from "./middleware/auth.js";
import { attachUserIfExists } from "./middleware/auth.js";
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import flash from 'connect-flash';
import session from 'express-session';
const app = express();
const PORT = process.env.PORT || 5000;
import methodOverride from "method-override";


app.use(methodOverride("_method"));

// View engine setup

app.set("view engine", "ejs");
app.set("views", "./views");

// Static files
app.use("/uploads", express.static("public/uploads"));
app.use("/itemPics", express.static("public/itemPics"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Flash messages

app.use(
  session({
    secret: process.env.FLASH_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 
    }
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes

import itemRoutes from './routes/itemRoute.js';
import userRoutes from './routes/userRoute.js';
import cartRoutes from "./routes/cartRoute.js";
import Item from './models/item.js';

app.use(attachUserIfExists);

app.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const items = await Item.find(filter).populate('createdBy');

    res.render("home", {
      items,
      user: req.user || null,
      token: req.cookies.token || "",
      category,
      minPrice,
      maxPrice
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});
app.use('/auth', userRoutes);

app.use(checkForAuthenticationCookies);


app.use('/items', itemRoutes);
app.use("/cart", cartRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
