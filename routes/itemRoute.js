import express from "express";
import Item from "../models/item.js";
const router = express.Router();
import getUploader from "../middleware/uploadMiddleware.js";
import { console } from "inspector";
const upload = getUploader("itemPics");

// CREATE item (only logged-in user)

router.get("/", async (req, res) => {
  res.render("addItems", { user: req.user || null, token: req.cookies.token || "" });
});

router.post("/", upload.array("images", 5), async (req, res) => {

  try {
    const imagePaths = req.files ? req.files.map(f => "/itemPics/" + f.filename) : [];

    const item = new Item({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      imageUrl: imagePaths,
      createdBy: req.user.id
    });

    await item.save();
    console.log("item stored", item);

    req.flash("success", "Item added successfully");
    res.redirect("/");
  } catch (err) {
    req.flash("Somethis bad happend")
    res.redirect("/");
  }
});

// READ single item (public)

router.get("/view/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("createdBy", "_id name email");
    if (!item) {
      req.flash("Item not found")
      return res.redirect("/")
    }
    res.render("viewItem", {
      item,
      user: req.user ? { ...req.user, _id: req?.user?._id?.toString() } : null,
      token: req.cookies.token || ""
    });
    console.log("Viewing item:", item);
  } catch (err) {
    req.flash("error", "Error 404!")
    return res.redirect("/")
  }
});

// UPDATE item (only creator)
router.get("/edit/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      req.flash("Item not found")
      return res.render("/")
    }

    res.render("editItem", { item, user: req.user });
  } catch (err) {
    req.flash("Errot", "Something went Wrong!")
    res.redirect("/")
  }
});

router.patch("/edit/:id", upload.array("images", 5), async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      req.flash("Item not found")
      return res.render("/")
    }

    item.name = req.body.name;
    item.price = req.body.price;
    item.category = req.body.category;
    item.description = req.body.description;

    // Replace images if new ones are uploaded
    if (req.files && req.files.length > 0) {
      item.imageUrl = req.files.map(f => "/itemPics/" + f.filename);
    }

    await item.save();
    req.flash("success", "Item updated successfully");
    res.redirect("/");
  } catch (err) {
    req.flash("Error","Cannot edit")
    res.redirect("/")
  }
});


// DELETE item (only creator)
router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      req.flash("Item not found")
      return res.render("/")
    }

    if (item.createdBy.toString() !== req.user.id) {
      req.flash("Not Authenticated")
      return res.render("/")
    }

    await item.deleteOne();
    req.flash("success", "Item deleted successfully");
    res.redirect('/');
  } catch (err) {
    req.flash("error", "Error deleting item: " + err.message);
    res.redirect("/")
  }
});

export default router;
