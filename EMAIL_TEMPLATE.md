# Professional Email Template for EmailJS

## Your Service ID
```
service_bpq49tq
```

---

## Email Template Configuration

### Step 1: Create New Template in EmailJS Dashboard

1. Go to **Email Templates** → **Create New Template**
2. **Template Name**: `BXARCHI Contact Form`

---

## Step 2: Email Settings

### **To Email:**
```
Wambuiraymond03@gmail.com
```

### **From Name:**
```
BXARCHI Contact Form
```

### **Reply To:**
```
{{from_email}}
```
*This allows you to reply directly to the person who sent the message*

---

## Step 3: Subject Line

```
New Contact Message from {{from_name}} - {{subject}}
```

---

## Step 4: Email Content (HTML Template)

Copy and paste this **ENTIRE CODE** into the **Content** section:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .info-card {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .info-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 16px;
            color: #333;
            word-wrap: break-word;
        }
        .message-box {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 20px;
            margin-top: 20px;
        }
        .message-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .message-content {
            font-size: 15px;
            color: #333;
            line-height: 1.8;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e0e0e0;
        }
        .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #666;
        }
        .reply-button {
            display: inline-block;
            margin-top: 15px;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
        }
        .divider {
            height: 1px;
            background-color: #e0e0e0;
            margin: 25px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📬 New Contact Form Message</h1>
            <p>BXARCHI Platform</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Sender Information -->
            <div class="info-card">
                <div class="info-label">👤 From</div>
                <div class="info-value">{{from_name}}</div>
            </div>

            <div class="info-card">
                <div class="info-label">📧 Email Address</div>
                <div class="info-value">{{from_email}}</div>
            </div>

            <div class="info-card">
                <div class="info-label">📋 Subject</div>
                <div class="info-value">{{subject}}</div>
            </div>

            <div class="divider"></div>

            <!-- Message Content -->
            <div class="message-box">
                <div class="message-label">💬 Message</div>
                <div class="message-content">{{message}}</div>
            </div>

            <!-- Reply Button -->
            <div style="text-align: center;">
                <a href="mailto:{{from_email}}?subject=Re: {{subject}}" class="reply-button">
                    Reply to {{from_name}}
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>BXARCHI</strong> - Book Publishing Platform</p>
            <p>This message was sent via the contact form on your website</p>
            <p style="font-size: 11px; color: #999; margin-top: 10px;">
                Received on {{current_date}} at {{current_time}}
            </p>
        </div>
    </div>
</body>
</html>
```

---

## Step 5: Template Variables

Make sure these variables are properly mapped in EmailJS:

| Variable Name | Description |
|--------------|-------------|
| `{{from_name}}` | Sender's name |
| `{{from_email}}` | Sender's email address |
| `{{subject}}` | Message subject |
| `{{message}}` | Message content |

---

## Step 6: Alternative - Simple Text Template

If you prefer a simpler text-only version:

```
Subject: New Contact from {{from_name}} - {{subject}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 NEW CONTACT FORM SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 FROM:
{{from_name}}

📧 EMAIL:
{{from_email}}

📋 SUBJECT:
{{subject}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 MESSAGE:

{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This message was sent from the BXARCHI contact form.
To reply, simply respond to this email.

---
BXARCHI - Book Publishing Platform
```

---

## What the Email Will Look Like

When someone fills out your contact form with:
- **Name**: John Doe
- **Email**: john@example.com
- **Subject**: Question about publishing
- **Message**: How do I publish my first book?

You'll receive a beautiful, professional email showing:
- ✅ Sender's full name
- ✅ Sender's email (clickable to reply)
- ✅ Subject line
- ✅ Full message content
- ✅ One-click reply button
- ✅ Professional BXARCHI branding

---

## Next Steps

1. ✅ Service ID is already set: `service_bpq49tq`
2. ⏳ Copy the HTML template above into EmailJS
3. ⏳ Get your Template ID from EmailJS
4. ⏳ Get your Public Key from EmailJS Account settings
5. ⏳ Add them to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_bpq49tq
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx  # Add this
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx    # Add this
```

6. ⏳ Restart your dev server
7. ✅ Test the contact form!

---

## Testing

After setup, test by:
1. Going to `http://localhost:3000/contact`
2. Fill out the form
3. Click "Send Message"
4. Check **Wambuiraymond03@gmail.com** inbox
5. You should see a beautiful, professional email! 📧

---

**Need help?** The email template includes all user information in a clean, professional format that's easy to read and respond to!
