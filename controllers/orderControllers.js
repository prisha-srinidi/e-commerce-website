const Order = require("../models/order");
const Cart = require("../models/cart");
const config = require("config");
const User = require("../models/users");
const stripe = require("stripe")(config.get("StripeAPIKey"));

module.exports.get_orders = async (req, res) => {
  const userId = req.params.id;
  Order.find({ userId })
    .sort({ date: -1 })
    .then((order) => res.json({ order }));
};

module.exports.checkout = async (req, res) => {
  try {
    const userId = req.params.id;
    const { source } = req.body;
    const user = User.findOne({ _id: userId });
    const Cart = Cart.findOne({ userId });
    const email = user.email;
    if (Cart) {
      const charges = await stripe.charges.create({
        amount: Cart.bill,
        currency: "inr",
        source: source,
        receipt_email: email,
      });
      if (!charges) {
        throw error("payment failed");
      }
      if (charges) {
        const order = await Order.create({
          userId,
          items: cart.items,
          bill: cart.bill,
        });

        const data = Cart.findByIdAndDelete(userId);
        return res.status(201).send(order);
      }
    } else {
      res.status(500).send("no items in cart");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send("wrong");
  }
};
