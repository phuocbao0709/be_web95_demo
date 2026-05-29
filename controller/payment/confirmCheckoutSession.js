const Stripe = require("stripe");
const completeCheckoutSession = require("./completeCheckoutSession");

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

const confirmCheckoutSession = async (req, res) => {
  try {
    const sessionId = req.query.session_id || req.body?.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        message: "session_id is required",
        error: true,
        success: false,
      });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(String(sessionId));

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment is not completed yet",
        error: true,
        success: false,
      });
    }

    const order = await completeCheckoutSession(
      session.id,
      String(session.payment_intent || ""),
    );

    return res.json({
      message: "Checkout confirmed",
      data: order,
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to confirm checkout session",
      error: true,
      success: false,
    });
  }
};

module.exports = confirmCheckoutSession;
