const orderModel = require("../../models/orderModel");
const userModel = require("../../models/userModel");

const allowedStatuses = ["paid", "processing", "shipped", "delivered", "cancelled"];

const updateOrderStatus = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required",
        error: true,
        success: false,
      });
    }

    const { orderId, orderStatus } = req.body;

    if (!orderId || !allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        message: "Invalid order status update",
        error: true,
        success: false,
      });
    }

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      {
        orderStatus,
      },
      {
        new: true,
      },
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    return res.json({
      message: "Order status updated",
      data: order,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

module.exports = updateOrderStatus;
