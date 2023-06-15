const { model } = require("mongoose");
const Cart = require("../models/cart");
const Item = require("../models/item");

module.exports.get_cart_items = async (req, res) => {
  const userId = req.params.id;
  try {
    let cart = await Cart.findOne({ userId });
    if (cart && cart.items.length > 0) {
      res.send(cart);
    } else {
      res.send(null);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "wrong" });
  }
};

module.exports.add_cart_item = async (req, res) => {
  const userId = req.params.id;
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId });
    let item = await Cart.findOne({ _id: productId });
    if (!item) {
      res.status(404).json({ message: "item not found" });
    }
    const price = item.price;
    const name = item.title;

    if (cart) {
      let itemIndex = cart.items.findIndex((p) => p.productId == productId);
      //means that item is already present in cart
      if (itemIndex > -1) {
        let productItem = cart.items[itemIndex];
        productItem.quantity += quantity;
        cart.items[itemIndex] = productItem; //i think this is redundant
      } else {
        //push the item into the cart
        cart.items.push({ productId, name, quantity, price });
      }
      cart.bill += quantity * price;
      cart = await cart.save();
      return res.status(201).send(cart);
    }
    //if cart does not exist
    else {
      const newCart = await Cart.create({
        userId,
        items: [{ productId, name, quantity, price }],
        bill: quantity * price,
      });
      return res.status(201).send(newCart);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("wrong");
  }
};

module.exports.delete_item = async (req, res) => {
  const userId = req.params.userId;
  const productId = req.params.itemId;
  try {
    let cart = await Cart.findOne({ userId });
    let itemIndex = cart.items.findIndex((p) => p.productId === productId);
    if (itemIndex > -1) {
      let productItem = cart.items[itemIndex];
      cart.bill -= productItem.quantity * productItem.price;
      cart.items.splice(itemIndex, 1);
    }
    cart = await cart.save();
    return res.status(201).send(cart);
  } catch (err) {
    console.log(err);
    res.status(500).send("wrong");
  }
};
