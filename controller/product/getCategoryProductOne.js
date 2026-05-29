const productModel = require("../../models/productModel");

const getCategoryProduct = async (_req, res) => {
  try {
    const productByCategory = await productModel.aggregate([
      {
        $match: {
          category: {
            $type: "string",
            $nin: ["", null],
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$category",
          product: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$product",
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ]);

    return res.json({
      message: "category product",
      data: productByCategory,
      success: true,
      error: false,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to load category products",
      error: true,
      success: false,
    });
  }
};

module.exports = getCategoryProduct;
