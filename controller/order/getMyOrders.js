const orderModel = require("../../models/orderModel");

const getMyOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        userId: req.userId,
      })
      .sort({ createdAt: -1 });

    return res.json({
      data: orders,
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

module.exports = getMyOrders;
