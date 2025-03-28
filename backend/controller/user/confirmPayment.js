const orderModel = require("../../models/orders");
const addToCartModel = require("../../models/cartProduct");

const confirmPayment = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (status !== "PAID") {
      return res.status(400).json({ message: "Payment was not successful!" });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status: "Paid" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    await addToCartModel.deleteMany({ userId: order.userId });

    res.status(200).json({
      message: "Payment successful, order updated, and cart cleared!",
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: "Error confirming payment", error });
  }
};

module.exports = confirmPayment;
