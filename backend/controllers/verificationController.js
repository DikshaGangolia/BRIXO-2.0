const crypto = require("crypto");
const { Resend } = require("resend");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

// In-memory verification storage with expiration & rate-limiting
// Key: normalized phone, cleanPhone, or cleanEmail_cleanPhone
const verificationStore = new Map();
const rateLimitStore = new Map();

// Helper to normalize phone numbers for consistent comparison & E.164 formatting
const normalizePhone = (rawPhone) => {
  const str = String(rawPhone || "").trim();
  const digitsOnly = str.replace(/\D/g, "");
  // Indian 11 digits starting with 0: e.g. 09876543210 -> +919876543210
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return "+91" + digitsOnly.slice(1);
  }
  // Standard 10-digit Indian number: e.g. 9876543210 -> +919876543210
  if (digitsOnly.length === 10) {
    return "+91" + digitsOnly;
  }
  // 12 digits starting with 91: e.g. 919876543210 -> +919876543210
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return "+" + digitsOnly;
  }
  if (str.startsWith("+")) {
    return "+" + digitsOnly;
  }
  return digitsOnly ? "+" + digitsOnly : "";
};

const formatE164Phone = (rawPhone) => {
  return normalizePhone(rawPhone);
};

// Dynamic email dispatcher supporting Nodemailer (Gmail/SMTP) and Resend
const sendEmailOtp = async (toEmail, code) => {
  if (!toEmail) return { sent: false, status: "No email provided" };

  // Option 1: Nodemailer (Gmail or custom SMTP)
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass && !emailUser.includes("your_") && !emailPass.includes("your_")) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        host: process.env.SMTP_HOST || undefined,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"BRIXO Verification" <${emailUser}>`,
        to: toEmail,
        subject: `🛒 BRIXO Verification Code: ${code}`,
        text: `Hello,\n\nYour BRIXO email verification code is: ${code}\nThis code will expire in 10 minutes.\n\nThank you!`,
        html: `<div style="font-family:sans-serif;padding:24px;background:#f8fafc;border-radius:12px;color:#1e293b;max-width:480px;margin:0 auto;border:1px solid #e2e8f0;">
          <h2 style="color:#2563eb;margin-top:0;">🛒 BRIXO Order Verification</h2>
          <p>Hello,</p>
          <p>Your 6-digit email verification code for customer checkout is:</p>
          <div style="font-size:30px;font-weight:900;letter-spacing:6px;padding:16px 24px;background:#ffffff;border:2px solid #2563eb;border-radius:10px;color:#0f172a;text-align:center;margin:16px 0;">
            ${code}
          </div>
          <p style="color:#64748b;font-size:12px;line-height:1.5;">This code is valid for 10 minutes. If you did not initiate this checkout, please ignore this email.</p>
        </div>`,
      });

      console.log(`[Email Delivered] Verification code ${code} sent to ${toEmail} via Nodemailer (${emailUser})`);
      return { sent: true, status: `Verification email delivered to ${toEmail}` };
    } catch (err) {
      console.error("[Nodemailer Error]:", err.message);
      return { sent: false, status: `Nodemailer dispatch failed: ${err.message}` };
    }
  }

  // Option 2: Resend API
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && !resendKey.includes("dummy") && !resendKey.includes("your_")) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "BRIXO Verification <onboarding@resend.dev>",
        to: [toEmail],
        subject: `🛒 BRIXO Verification Code: ${code}`,
        text: `Hello,\n\nYour BRIXO email verification code is: ${code}\nThis code will expire in 10 minutes.\n\nThank you!`,
      });

      console.log(`[Email Delivered] Verification code ${code} sent to ${toEmail} via Resend`);
      return { sent: true, status: `Verification email delivered to ${toEmail} via Resend.` };
    } catch (err) {
      console.error("[Resend Error]:", err.message);
      return { sent: false, status: `Resend dispatch failed: ${err.message}` };
    }
  }

  return {
    sent: false,
    status: "Email credentials not configured in backend/.env (set EMAIL_USER & EMAIL_PASS for Gmail, or RESEND_API_KEY).",
  };
};

// Dynamic SMS dispatcher supporting Twilio
const sendSmsOtp = async (toPhone, code) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const fromNum = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && fromNum && !sid.includes("dummy") && !sid.includes("your_") && !token.includes("your_")) {
    try {
      const client = twilio(sid, token);
      const formattedPhone = formatE164Phone(toPhone);

      const msg = await client.messages.create({
        body: `🛒 BRIXO Verification Code: ${code}. Valid for 10 minutes.`,
        from: fromNum,
        to: formattedPhone,
      });

      console.log(`[SMS Delivered] Verification code ${code} sent to ${formattedPhone} via Twilio (SID: ${msg.sid})`);
      return { sent: true, status: `SMS delivered to ${formattedPhone} via Twilio.` };
    } catch (err) {
      console.error("[Twilio Error]:", err.message);
      let friendlyStatus = `Twilio SMS dispatch failed: ${err.message}`;
      const isTrial = (err.code === 21608) || (err.message && err.message.includes("Trial accounts"));
      if (isTrial) {
        friendlyStatus = `Twilio Trial Mode: Destination number is unverified in your Twilio console. Only verified phone numbers (+919528620651) receive real SMS in Trial mode.`;
      }
      return { sent: false, status: friendlyStatus, isTrialRestriction: isTrial };
    }
  }

  return {
    sent: false,
    status: "Twilio credentials not configured in backend/.env (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).",
  };
};

const sendVerificationCodes = async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Customer mobile phone number is required for verification",
      });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : "";
    const cleanPhone = String(phone).trim();
    const normalizedPhone = normalizePhone(cleanPhone);
    const tenDigits = normalizedPhone.slice(-10);

    // Rate limiting
    const now = Date.now();
    const storeKey = normalizedPhone || cleanPhone;
    const userAttempts = rateLimitStore.get(storeKey) || [];
    const recentAttempts = userAttempts.filter(timestamp => now - timestamp < 5 * 60 * 1000);

    if (recentAttempts.length >= 25) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Please wait a few minutes before requesting verification codes again.",
      });
    }

    recentAttempts.push(now);
    rateLimitStore.set(storeKey, recentAttempts);

    // Generate random 6-digit verification code
    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    const verificationRecord = {
      phoneCode,
      expiresAt,
      verified: false,
      cleanPhone,
      normalizedPhone,
      email: cleanEmail,
    };

    // Store under multiple keys for resilient multi-format matching
    if (normalizedPhone) verificationStore.set(normalizedPhone, verificationRecord);
    if (cleanPhone) verificationStore.set(cleanPhone, verificationRecord);
    if (tenDigits) verificationStore.set(tenDigits, verificationRecord);
    if (cleanEmail) {
      verificationStore.set(cleanEmail, verificationRecord);
      if (normalizedPhone) verificationStore.set(`${cleanEmail}_${normalizedPhone}`, verificationRecord);
      if (cleanPhone) verificationStore.set(`${cleanEmail}_${cleanPhone}`, verificationRecord);
    }

    // Dispatch Twilio SMS OTP
    const smsResult = await sendSmsOtp(normalizedPhone || cleanPhone, phoneCode);

    // Also dispatch Email OTP if customer email is provided
    let emailResult = { sent: false, status: "No email address provided" };
    if (cleanEmail) {
      emailResult = await sendEmailOtp(cleanEmail, phoneCode);
    }

    console.log("================================================================");
    console.log(`📱 [BRIXO VERIFICATION CODE DISPATCH]`);
    console.log(`   Target Phone : ${cleanPhone} (${normalizedPhone})`);
    if (cleanEmail) console.log(`   Target Email : ${cleanEmail}`);
    console.log(`   🔑 CODE (OTP): ${phoneCode}`);
    console.log(`   SMS Status   : ${smsResult.sent ? "✅ DELIVERED VIA TWILIO" : "⚠️ " + smsResult.status}`);
    if (cleanEmail) console.log(`   Email Status : ${emailResult.sent ? "✅ DELIVERED VIA EMAIL" : "ℹ️ " + emailResult.status}`);
    console.log("================================================================");

    return res.status(200).json({
      success: true,
      message: smsResult.sent
        ? `Mobile SMS verification code sent to ${cleanPhone}`
        : (smsResult.isTrialRestriction
            ? "Twilio Trial mode: Real SMS is restricted to verified numbers (+919528620651). Verification code provided for testing."
            : "Verification code generated successfully"),
      smsSent: smsResult.sent,
      smsStatus: smsResult.status,
      emailSent: emailResult.sent,
      emailStatus: emailResult.status,
      // Provide code so testing is never blocked if external gateway is restricted or offline
      devCodes: { phoneCode },
      devPhoneCode: phoneCode,
      phoneCode: phoneCode,
    });

  } catch (error) {
    console.error("Send verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error sending verification code",
      error: error.message,
    });
  }
};

const findVerificationRecord = (email, phone) => {
  const cleanEmail = email ? String(email).trim().toLowerCase() : "";
  const rawPhone = String(phone || "").trim();
  const normalized = normalizePhone(rawPhone);
  const tenDigits = normalized.slice(-10);

  return (normalized && verificationStore.get(normalized))
    || (rawPhone && verificationStore.get(rawPhone))
    || (tenDigits && verificationStore.get(tenDigits))
    || (cleanEmail && normalized && verificationStore.get(`${cleanEmail}_${normalized}`))
    || (cleanEmail && rawPhone && verificationStore.get(`${cleanEmail}_${rawPhone}`))
    || (cleanEmail && verificationStore.get(cleanEmail))
    || null;
};

const validateVerificationCodes = async (req, res) => {
  try {
    const { email, phone, phoneCode } = req.body;

    if ((!phone && !email) || !phoneCode) {
      return res.status(400).json({
        success: false,
        message: "Customer phone number or email, and verification code are required",
      });
    }

    const cleanEmail = email ? String(email).trim().toLowerCase() : "";
    const cleanPhone = String(phone || "").trim();
    const record = findVerificationRecord(cleanEmail, cleanPhone);

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "No verification request found for this mobile number or email. Please request a new code.",
      });
    }

    if (Date.now() > record.expiresAt) {
      const normalized = normalizePhone(cleanPhone);
      if (normalized) verificationStore.delete(normalized);
      if (cleanPhone) verificationStore.delete(cleanPhone);
      if (cleanEmail) verificationStore.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    const codeMatch = String(phoneCode).trim() === String(record.phoneCode).trim();

    if (!codeMatch) {
      return res.status(400).json({
        success: false,
        message: "Verification code is incorrect",
      });
    }

    // Mark as verified and issue token
    record.verified = true;
    const tokenPayload = `${cleanEmail}|${cleanPhone || record.cleanPhone}|${Date.now()}`;
    const tokenSecret = process.env.JWT_SECRET || "brixo_jwt_secret_dev_key_987654";
    const verificationToken = crypto.createHmac("sha256", tokenSecret).update(tokenPayload).digest("hex") + "." + Buffer.from(tokenPayload).toString("base64");

    record.verificationToken = verificationToken;

    return res.status(200).json({
      success: true,
      message: "Mobile number verified successfully!",
      verificationToken,
      token: verificationToken, // Backwards compatibility for data.token callers
    });

  } catch (error) {
    console.error("Validate verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error validating verification code",
      error: error.message,
    });
  }
};

const isCustomerVerified = (email, phone, token) => {
  if (!phone && !email) return false;
  const cleanEmail = email ? String(email).trim().toLowerCase() : "";
  const rawPhone = String(phone || "").trim();
  const record = findVerificationRecord(cleanEmail, rawPhone);

  if (record && record.verified) {
    if (!token || record.verificationToken === token) {
      return true;
    }
  }

  // Also verify token signature if present
  if (token && token.includes(".")) {
    try {
      const [signature, b64Payload] = token.split(".");
      const payload = Buffer.from(b64Payload, "base64").toString("utf-8");
      const [tokenEmail, tokenPhone, timestamp] = payload.split("|");
      const tokenSecret = process.env.JWT_SECRET || "brixo_jwt_secret_dev_key_987654";
      const expectedSig = crypto.createHmac("sha256", tokenSecret).update(payload).digest("hex");

      const normalizedTokenPhone = normalizePhone(tokenPhone);
      const normalizedReqPhone = normalizePhone(rawPhone);

      const phoneMatches = !rawPhone || (normalizedTokenPhone && normalizedTokenPhone === normalizedReqPhone) || (tokenPhone === rawPhone) || (tokenPhone.slice(-10) === rawPhone.slice(-10));

      if (signature === expectedSig && phoneMatches) {
        if (Date.now() - parseInt(timestamp, 10) < 60 * 60 * 1000) { // 60 minutes
          return true;
        }
      }
    } catch (_e) {
      return false;
    }
  }

  return false;
};

module.exports = {
  formatE164Phone,
  normalizePhone,
  sendVerificationCodes,
  validateVerificationCodes,
  isCustomerVerified,
};
