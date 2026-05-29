const orderModel = require("../../models/orderModel");
const userModel = require("../../models/userModel");

const getOrderDetails = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
        error: true,
        success: false,
      });
    }

    const user = await userModel.findById(req.userId);
    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin && order.userId !== String(req.userId)) {
      return res.status(403).json({
        message: "Access denied",
        error: true,
        success: false,
      });
    }

    return res.json({
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

module.exports = getOrderDetails;
