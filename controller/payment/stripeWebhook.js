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

const stripeWebhook = async (req, res) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).send("Missing Stripe webhook secret");
  }

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await completeCheckoutSession(
        session.id,
        String(session.payment_intent || ""),
      );
    }

    return res.json({ received: true });
  } catch (error) {
    return res.status(500).send(error.message || "Webhook processing failed");
  }
};

module.exports = stripeWebhook;
