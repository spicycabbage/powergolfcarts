# Stripe Payment Integration Setup

This guide will help you set up Stripe payment integration for your Power Golf Carts e-commerce site.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard
3. Your site deployed or running locally

## Step 1: Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
5. Keep these keys secure and never commit them to version control

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site URL (required for Stripe redirects)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com  # or http://localhost:3000 for local
```

## Step 3: Set Up Stripe Tax (Optional but Recommended)

Stripe Tax automatically calculates sales tax based on the customer's location:

1. Go to **Settings** → **Tax** in your Stripe Dashboard
2. Click **Get started** to enable Stripe Tax
3. Configure your tax settings:
   - Add your business locations
   - Set up tax registrations for states where you collect tax
   - Configure product tax categories if needed

## Step 4: Configure Webhooks

Webhooks allow Stripe to notify your application about payment events in real-time.

### For Production:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`) and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### For Local Development:

Use the Stripe CLI to forward webhooks to your local development server:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret from the CLI output and add it to your `.env.local`

## Step 5: Test the Integration

### Test Cards

Use these test card numbers in test mode:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Payment declined |

- Use any future expiration date (e.g., 12/34)
- Use any 3-digit CVC
- Use any ZIP code

### Test Checkout Flow

1. Add products to cart
2. Go to checkout
3. Fill in shipping information
4. Click "Proceed to Payment"
5. You should be redirected to Stripe Checkout
6. Use a test card to complete payment
7. You should be redirected back to your success page
8. Verify the order appears in your admin panel

## Step 6: Monitor Payments

### View Payments

1. Go to **Payments** in your Stripe Dashboard
2. You'll see all successful and failed payments
3. Click on any payment to see details

### View Orders

1. Log in to your admin panel at `/admin`
2. Navigate to **Orders**
3. You should see orders with payment method "stripe"
4. Orders paid successfully will have status "processing"

### Check Webhook Logs

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click on your webhook endpoint
3. View the **Event log** to see all webhook events
4. Check for any failed events and debug as needed

## Step 7: Go Live

When you're ready to accept real payments:

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode** (top right)
2. Generate new **Live API keys** from **Developers** → **API keys**
3. Update your `.env.local` with live keys:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   ```
4. Create a new webhook endpoint for your live site
5. Update `STRIPE_WEBHOOK_SECRET` with the live webhook secret
6. Complete Stripe account verification (provide business details, tax info, etc.)
7. Test thoroughly before announcing

## Features Included

### ✅ Stripe Checkout
- Secure, PCI-compliant payment processing
- Mobile-optimized checkout experience
- Support for credit/debit cards
- Apple Pay and Google Pay (automatically enabled)

### ✅ Automatic Tax Calculation
- Stripe Tax integration
- Automatic sales tax calculation based on location
- Support for US and Canada

### ✅ Payment Status Tracking
- Real-time payment status updates via webhooks
- Automatic order status updates
- Email notifications (configure in your email settings)

### ✅ Order Management
- Full order tracking in admin panel
- Payment method details stored with each order
- Refund support through Stripe Dashboard

## Troubleshooting

### Webhook Events Not Received

- Check that your webhook endpoint is publicly accessible
- Verify the webhook secret is correct
- Check webhook logs in Stripe Dashboard for errors
- For local development, ensure Stripe CLI is running

### Payment Succeeded but Order Not Created

- Check application logs for errors
- Verify database connection
- Check webhook signature verification
- Ensure all required environment variables are set

### Customers Not Redirected After Payment

- Verify `NEXT_PUBLIC_BASE_URL` is set correctly
- Check that success/cancel URLs are properly configured
- Look for console errors in browser dev tools

### Tax Not Calculating

- Ensure Stripe Tax is enabled in your Stripe Dashboard
- Verify tax settings for your business location
- Check that `automatic_tax: { enabled: true }` is in checkout session

## Security Best Practices

1. **Never expose secret keys**: Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` server-side only
2. **Verify webhook signatures**: Always verify webhook signatures (already implemented)
3. **Use HTTPS in production**: Stripe requires HTTPS for live payments
4. **Implement rate limiting**: Protect your API endpoints from abuse
5. **Log security events**: Monitor for suspicious payment activity
6. **Keep dependencies updated**: Regularly update Stripe SDK and other packages

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **Application Issues**: Contact your development team

## Next Steps

- [ ] Set up Stripe account
- [ ] Add API keys to environment variables
- [ ] Configure Stripe Tax
- [ ] Set up webhooks
- [ ] Test with test cards
- [ ] Verify orders in admin panel
- [ ] Complete Stripe account verification
- [ ] Switch to live mode when ready

---

**Note**: This integration uses Stripe Checkout, which is the easiest and most secure way to accept payments. For more advanced customization, consider implementing Stripe Payment Element or Payment Intents API directly.
