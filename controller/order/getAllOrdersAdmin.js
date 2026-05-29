const orderModel = require("../../models/orderModel");
const userModel = require("../../models/userModel");

const getAllOrdersAdmin = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required",
        error: true,
        success: false,
      });
    }

    const orders = await orderModel.find().sort({ createdAt: -1 });

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

module.exports = getAllOrdersAdmin;
