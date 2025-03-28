const orderModel = require("../../models/orders");
const addToCartModel = require("../../models/cartProduct");
const axios = require("axios");
const PayOS = require("@payos/node");
const payos = new PayOS(
  "ec630018-8708-4d62-a897-03c5917fa6f6",
  "1b11e579-f4f6-443c-b736-27c07174fa93",
  "8a833356cd857a93e2624eebb2b915d27dd0ff27b0ea1e406a394846777ad394"
);

const createOrder = async (req, res) => {
  try {
    const { paymentMethod, userId } = req.body;
    const cartItems = await addToCartModel.find({ userId });
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống!" });
    }

    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      priceAtPurchase: item.price,
    }));

    const totalAmount = items.reduce(
      (total, item) => total + item.quantity * item.priceAtPurchase,
      0
    );

    const order = new orderModel({
      userId,
      items,
      totalAmount,
      status: "Unpaid",
      paymentMethod,
      shippingAddress: "Hà Nội, Việt Nam",
    });

    await order.save();
    if (paymentMethod === "PayOS") {
      try {
        const orderPayment = {
          amount: order.totalAmount,
          orderCode: new Date().getTime(),
          returnUrl: `http://localhost:3000/payment-success?orderId=${order._id}`,
          cancelUrl: "http://localhost:3000/payment-failed",
          description: "Pay shopping bills",
        };

        const paymentLink = await payos.createPaymentLink(orderPayment);
        return res.status(201).json({
          message: "Đơn hàng đã được tạo!",
          paymentUrl: paymentLink.checkoutUrl,
        });
      } catch (error) {
        console.error(
          "❌ Error Pay shopping bills:",
          error.response?.data || error.message
        );
        return res
          .status(500)
          .json({ message: "Error Pay shopping bills", error });
      }
    }

    res.status(201).json({ message: "Đơn hàng đã được tạo!", order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo đơn hàng", error });
  }
};

module.exports = createOrder;
