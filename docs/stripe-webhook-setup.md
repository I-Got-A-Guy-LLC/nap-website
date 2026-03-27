# Stripe Webhook Setup

Follow these steps to connect Stripe webhooks to the NAP Directory site.

## 1. Open the Stripe Dashboard

Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign in.

## 2. Navigate to Webhooks

Click **Developers** in the top-right, then select **Webhooks** from the sidebar.

## 3. Add a New Endpoint

Click **Add endpoint**.

## 4. Enter the Endpoint URL

```
https://networkingforawesomepeople.com/api/stripe/webhook
```

## 5. Select Events

Choose these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 6. Save the Endpoint

Click **Add endpoint** to save.

## 7. Copy the Signing Secret

After the endpoint is created, click on it and reveal the **Signing secret**. It starts with `whsec_`.

## 8. Add the Secret to Vercel

Go to your Vercel project settings, then **Environment Variables**. Add:

- **Name:** `STRIPE_WEBHOOK_SECRET`
- **Value:** *(paste the signing secret)*

Make sure it is available to **Production**, **Preview**, and **Development** as needed.

## 9. Redeploy

Trigger a new deployment in Vercel so the environment variable takes effect.
