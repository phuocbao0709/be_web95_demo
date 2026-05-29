const addToCartModel = require("../../models/cartProduct");
const checkoutSessionModel = require("../../models/checkoutSessionModel");
const orderModel = require("../../models/orderModel");

const completeCheckoutSession = async (stripeSessionId, paymentIntentId = "") => {
  if (!stripeSessionId) {
    throw new Error("Stripe session id is required");
  }

  const existingOrder = await orderModel.findOne({
    stripeSessionId,
  });

  if (existingOrder) {
    return existingOrder;
  }

  const draft = await checkoutSessionModel.findOne({
    stripeSessionId,
  });

  if (!draft) {
    throw new Error("Checkout session draft not found");
  }

  const order = await orderModel.create({
    userId: draft.userId,
    items: draft.items,
    totalQty: draft.totalQty,
    subtotal: draft.subtotal,
    shippingCost: draft.shippingCost,
    taxAmount: draft.taxAmount,
    grandTotal: draft.grandTotal,
    stripeSessionId,
    stripePaymentIntentId: paymentIntentId,
    paymentStatus: "paid",
    orderStatus: "paid",
  });

  await checkoutSessionModel.findByIdAndUpdate(draft._id, {
    status: "completed",
  });

  if (draft.userId) {
    await addToCartModel.deleteMany({
      userId: draft.userId,
    });
  }

  return order;
};

module.exports = completeCheckoutSession;
