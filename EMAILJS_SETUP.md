# EmailJS Setup Guide

This guide will help you configure EmailJS to receive contact form submissions at **Wambuiraymond03@gmail.com**.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click **Sign Up** (it's free - 200 emails/month)
3. Sign up with your email or Google account

## Step 2: Add Email Service

1. After logging in, go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose **Gmail** (recommended)
4. Click **Connect Account** and sign in with your Gmail: **Wambuiraymond03@gmail.com**
5. Give it a name like "BXARCHI Contact"
6. Click **Create Service**
7. **Copy the Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template:

### Template Settings:
- **Template Name**: Contact Form Submission

### Email Template Content:
```
Subject: New Contact Form Message - {{subject}}

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
This message was sent from the BXARCHI contact form.
```

### Template Variables:
Make sure these variables are included:
- `{{from_name}}`
- `{{from_email}}`
- `{{subject}}`
- `{{message}}`

4. In the **To Email** field, enter: **Wambuiraymond03@gmail.com**
5. Click **Save**
6. **Copy the Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to **Account** → **General** in the dashboard
2. Find your **Public Key** (it looks like: `YOUR_PUBLIC_KEY_HERE`)
3. **Copy the Public Key**

## Step 5: Add Environment Variables

1. Open the `.env.local` file in your BXARCHI project
2. Add these three lines (replace with your actual IDs):

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### Example:
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=AbCdEfGhIjKlMnOpQr
```

## Step 6: Restart Your Development Server

1. Stop your Next.js server (Ctrl+C in terminal)
2. Start it again:
```bash
npm run dev
```

## Step 7: Test the Contact Form

1. Go to your contact page: `http://localhost:3000/contact`
2. Fill out the form with test data
3. Click **Send Message**
4. Check your email at **Wambuiraymond03@gmail.com**
5. You should receive the message within seconds!

## Troubleshooting

### Not receiving emails?
- ✅ Check your spam/junk folder
- ✅ Verify all three environment variables are set correctly
- ✅ Make sure you restarted the dev server after adding env variables
- ✅ Check the browser console for any errors
- ✅ Verify your EmailJS account is connected to the correct Gmail

### "Failed to send message" error?
- ✅ Check that your EmailJS Service ID, Template ID, and Public Key are correct
- ✅ Make sure your EmailJS account is active
- ✅ Check if you've exceeded the free tier limit (200 emails/month)

### Template not working?
- ✅ Make sure the template variables match exactly: `{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`
- ✅ Verify the "To Email" is set to **Wambuiraymond03@gmail.com** in the template settings

## Free Tier Limits

EmailJS Free Plan includes:
- ✅ 200 emails per month
- ✅ 2 email services
- ✅ Unlimited templates
- ✅ No credit card required

If you need more emails, you can upgrade to a paid plan later.

## Security Note

The environment variables starting with `NEXT_PUBLIC_` are safe to use in the browser. EmailJS uses domain whitelisting to prevent abuse, so your keys can only be used from your authorized domains.

## Alternative: Add Domain Whitelist (Optional)

For extra security:
1. Go to **Account** → **Security** in EmailJS dashboard
2. Add your domain: `localhost:3000` (for development)
3. Add your production domain when you deploy

---

**That's it!** Your contact form will now send emails directly to **Wambuiraymond03@gmail.com**! 🎉
