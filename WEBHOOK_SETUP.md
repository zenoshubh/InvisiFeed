# Webhook Setup Guide for Development

This guide explains how to set up Razorpay webhooks for local development.

## Prerequisites

- Razorpay account with test/live keys
- Node.js and npm/pnpm installed
- A tunneling service (ngrok recommended)

## Step 1: Install ngrok (Recommended)

### Option A: Using Homebrew (macOS)
```bash
brew install ngrok
```

### Option B: Using npm (Global)
```bash
npm install -g ngrok
```

### Option C: Download from ngrok.com
Visit https://ngrok.com/download and download for your OS

## Step 2: Start Your Development Server

```bash
pnpm dev
# or
npm run dev
```

Your app should be running on `http://localhost:3000`

## Step 3: Start ngrok Tunnel

Open a new terminal and run:

```bash
ngrok http 3000
# Or use the npm script:
pnpm tunnel
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

> **Note:** If you see a browser warning page when testing the webhook URL:
> - **Razorpay webhooks won't see this** - they send proper headers automatically
> - **For browser testing:** Use a browser extension like "ModHeader" to add the header `ngrok-skip-browser-warning: true`
> - Or test via curl: `curl -H "ngrok-skip-browser-warning: true" https://your-url.ngrok.io/api/webhook/razorpay`

> **Important:** 
> - **With authtoken only:** URL still changes each time you restart ngrok
> - **For static URL:** You need a **reserved domain** (paid feature, ~$8/month)
> - **Workaround:** Keep ngrok running - the URL stays the same as long as ngrok is active

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id  # Same as KEY_ID for frontend

# Subscription Amount (in rupees)
SUBSCRIPTION_AMOUNT=99

# Webhook Secret (will be generated in Razorpay dashboard)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 5: Configure Webhook in Razorpay Dashboard

1. **Login to Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com
   - Use **Test Mode** for development

2. **Navigate to Webhooks**
   - Go to **Settings** → **Webhooks**
   - Click **"Add New Webhook"**

3. **Configure Webhook**
   - **Webhook URL**: `https://your-ngrok-url.ngrok.io/api/webhook/razorpay`
     - Replace `your-ngrok-url.ngrok.io` with your actual ngrok URL
   - **Active Events**: Select these events:
     - ✅ `payment.captured`
     - ✅ `payment.failed`
     - ✅ `refund.created`
     - ✅ `order.paid` (optional)

4. **Get Webhook Secret**
   - After creating the webhook, Razorpay will show a **Webhook Secret**
   - Copy this secret
   - Add it to your `.env.local` as `RAZORPAY_WEBHOOK_SECRET`

5. **Save Configuration**

## Step 6: Test the Webhook

### Option A: Test via Razorpay Dashboard
1. Go to **Webhooks** → Select your webhook
2. Click **"Send Test Webhook"**
3. Select event type (e.g., `payment.captured`)
4. Check your terminal/console for webhook logs

### Option B: Test via Actual Payment
1. Make a test payment in your app
2. Check your database for:
   - Payment record created with status "pending"
   - After payment, status should be "completed"
   - Subscription should be created

### Option C: Check Webhook Logs
1. In Razorpay Dashboard → **Webhooks** → Your webhook
2. Click **"Webhook Logs"** to see delivery status
3. Check for any failed deliveries

## Troubleshooting

### Webhook Not Receiving Events

1. **Check ngrok is running**
   ```bash
   # Verify ngrok is forwarding to localhost:3000
   curl https://your-ngrok-url.ngrok.io/api/webhook/razorpay
   ```

2. **Check webhook URL in Razorpay**
   - Ensure URL is `https://` (not `http://`)
   - Ensure path is `/api/webhook/razorpay`

3. **Check environment variables**
   ```bash
   # Verify RAZORPAY_WEBHOOK_SECRET is set
   echo $RAZORPAY_WEBHOOK_SECRET
   ```

4. **Check server logs**
   - Look for webhook errors in your Next.js console
   - Check for signature verification failures

### Signature Verification Failed

- Ensure `RAZORPAY_WEBHOOK_SECRET` matches the secret from Razorpay dashboard
- Restart your dev server after updating `.env.local`

### ngrok URL Changes Frequently

**Understanding ngrok URLs:**
- **Authtoken alone:** Doesn't make URL static, just enables account features
- **Reserved Domain:** Required for truly static URLs (paid feature ~$8/month)

**Solutions:**

**Option 1: Keep ngrok running (Free)**
- Don't restart ngrok - keep it running in background
- URL stays the same as long as ngrok process is active
- Use `pnpm tunnel` in a separate terminal and leave it running

**Option 2: Reserve a domain (Paid)**
1. Sign up for ngrok paid plan (~$8/month)
2. Go to ngrok dashboard → Reserved Domains
3. Reserve a subdomain (e.g., `myapp.ngrok.io`)
4. Start ngrok with: `ngrok http --domain=myapp.ngrok.io 3000`
5. URL will always be the same

**Option 3: Update webhook URL manually (Free)**
- Accept that URL changes on restart
- Update Razorpay webhook URL each time you restart ngrok
- Use Razorpay's "Send Test Webhook" to verify it works

## Alternative: Using localtunnel (Free, No Signup)

If you prefer not to use ngrok:

```bash
# Install localtunnel
npm install -g localtunnel

# Start tunnel
lt --port 3000 --subdomain your-subdomain
```

Then use: `https://your-subdomain.loca.lt/api/webhook/razorpay`

> **Note:** localtunnel URLs are less stable than ngrok

## Production Setup

For production, use your actual domain:

```
https://yourdomain.com/api/webhook/razorpay
```

Make sure:
- ✅ HTTPS is enabled
- ✅ `RAZORPAY_WEBHOOK_SECRET` is set in production environment
- ✅ Webhook is configured in Razorpay **Live Mode** dashboard

## Quick Reference

| Environment | Webhook URL |
|------------|-------------|
| Development | `https://your-ngrok-url.ngrok.io/api/webhook/razorpay` |
| Production | `https://yourdomain.com/api/webhook/razorpay` |

## Environment Variables Checklist

```bash
✅ RAZORPAY_KEY_ID
✅ RAZORPAY_KEY_SECRET
✅ NEXT_PUBLIC_RAZORPAY_KEY_ID
✅ SUBSCRIPTION_AMOUNT
✅ RAZORPAY_WEBHOOK_SECRET  # Critical for webhook verification
```

## Testing Checklist

- [ ] ngrok tunnel is running
- [ ] Dev server is running on port 3000
- [ ] Webhook URL configured in Razorpay dashboard
- [ ] `RAZORPAY_WEBHOOK_SECRET` is set in `.env.local`
- [ ] Test webhook sent successfully from Razorpay dashboard
- [ ] Payment records are created in database
- [ ] Subscriptions are created after successful payment

