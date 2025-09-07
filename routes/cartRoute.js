import express from "express";
import Cart from "../models/Cart.js";
import Item from "../models/item.js";
const router = express.Router();

// ✅ Get user cart
router.get("/", async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.item");
    if (!cart) cart = { items: [] };
    res.render("cart", { user: req.user, cart: cart.items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Add item to cart
router.post("/add/:itemId", async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const itemId = req.params.itemId;
    const existing = cart.items.find(c => c.item.toString() === itemId);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.items.push({ item: itemId, quantity: 1 });
    }

    await cart.save();
    req.flash("success", "Item added to cart");
    res.redirect("/cart");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Remove item
router.delete("/delete/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = cart.items.filter(c => c.item.toString() !== req.params.itemId);
      await cart.save();
    }
    req.flash("success", "Item removed from cart");
    res.redirect("/cart");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update quantity
router.post("/update/:itemId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      const cartItem = cart.items.find(c => c.item.toString() === req.params.itemId);
      if (cartItem) {
        cartItem.quantity = Number(req.body.quantity);
        await cart.save();
      }
    }
    req.flash("success", "Cart updated");
    res.redirect("/cart");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
