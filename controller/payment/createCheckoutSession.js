const Stripe = require("stripe");
const addToCartModel = require("../../models/cartProduct");
const checkoutSessionModel = require("../../models/checkoutSessionModel");

let stripeClient = null;

const getStripeClient = () => {
  if (stripeClient) {
    return stripeClient;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Stripe secret key is not configured");
  }

  stripeClient = new Stripe(secretKey);

  return stripeClient;
};

const buildAbsoluteImageUrl = (imageUrl, frontendUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null;
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (!frontendUrl) {
    return null;
  }

  try {
    return new URL(imageUrl, frontendUrl).toString();
  } catch (_error) {
    return null;
  }
};

const createCheckoutSession = async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      return res.status(500).json({
        message: "FRONTEND_URL is not configured",
        error: true,
        success: false,
      });
    }

    const currentUser = req.userId;
    const cartItems = await addToCartModel
      .find({
        userId: currentUser,
      })
      .populate("productId");

    const validCartItems = cartItems.filter(
      (item) =>
        item?.productId &&
        item?.quantity > 0 &&
        Number.isFinite(item?.productId?.sellingPrice) &&
        item.productId.sellingPrice > 0,
    );

    if (!validCartItems.length) {
      return res.status(400).json({
        message: "Your cart is empty or contains invalid items",
        error: true,
        success: false,
      });
    }

    const stripe = getStripeClient();
    const orderItems = validCartItems.map((item) => {
      const product = item.productId;
      const unitPrice = Number(product.sellingPrice || 0);

      return {
        productId: String(product._id || product.id || product.productId || ""),
        productName: product.productName || "TechPulse Product",
        brandName: product.brandName || "",
        category: product.category || "",
        productImage:
          Array.isArray(product.productImage) && product.productImage.length
            ? product.productImage[0]
            : "",
        quantity: Number(item.quantity || 0),
        unitPrice,
        lineTotal: unitPrice * Number(item.quantity || 0),
      };
    });
    const totalQty = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingCost = subtotal > 1500 ? 0 : 75;
    const taxAmount = Math.round(subtotal * 0.075);
    const grandTotal = subtotal + shippingCost + taxAmount;
    const lineItems = validCartItems.map((item) => {
      const product = item.productId;
      const imageUrl =
        Array.isArray(product.productImage) && product.productImage.length
          ? buildAbsoluteImageUrl(product.productImage[0], frontendUrl)
          : null;

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: product.productName || "TechPulse Product",
            description: product.description || undefined,
            images: imageUrl ? [imageUrl] : undefined,
          },
          unit_amount: Math.round(product.sellingPrice * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${frontendUrl.replace(/\/$/, "")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl.replace(/\/$/, "")}/checkout/cancel`,
      metadata: {
        userId: String(currentUser),
      },
    });

    await checkoutSessionModel.create({
      userId: String(currentUser),
      stripeSessionId: session.id,
      items: orderItems,
      totalQty,
      subtotal,
      shippingCost,
      taxAmount,
      grandTotal,
      status: "pending",
    });

    return res.json({
      success: true,
      error: false,
      url: session.url,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create checkout session",
      error: true,
      success: false,
    });
  }
};

module.exports = createCheckoutSession;
