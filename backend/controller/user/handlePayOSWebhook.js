const handlePayOSWebhook = async (req, res) => {
    try {
        const { orderCode, status } = req.body;

        if (status !== "PAID") {
            return res.status(400).json({ message: "Thanh toán chưa hoàn thành" });
        }

        const order = new orderModel({
            userId: req.user.id,
            items: req.body.items, 
            totalAmount: req.body.amount,
            status: "Paid",
            paymentMethod: "PayOS",
            shippingAddress: "Hà Nội, Việt Nam"
        });

        await order.save();
        await addToCartModel.deleteMany({ userId: req.user.id });

        res.status(200).json({ message: "Thanh toán thành công, đơn hàng đã được tạo!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi xử lý webhook", error });
    }
};


