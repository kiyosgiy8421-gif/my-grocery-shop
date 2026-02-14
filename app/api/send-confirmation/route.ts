import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const { email, confirmationLink } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const html = confirmationLink
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - Fresh Grocery</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Fresh Grocery</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your trusted online grocery store</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #171717; font-size: 20px; font-weight: 600;">Verify your email</h2>
              <p style="margin: 0 0 16px; color: #525252; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! Please click the button below to verify your email address and activate your account.
              </p>
              <p style="margin: 0 0 24px; color: #525252; font-size: 16px; line-height: 1.6;">
                You will be redirected to Fresh Grocery where you can sign in and start shopping.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #16a34a;">
                    <a href="${confirmationLink}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Confirm Email</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #737373; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${confirmationLink}" style="color: #16a34a; word-break: break-all;">${confirmationLink}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #737373; font-size: 13px; text-align: center;">
                If you did not create this account, you can safely ignore this email.
              </p>
              <p style="margin: 12px 0 0; color: #737373; font-size: 13px; text-align: center;">
                © Fresh Grocery. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim()
      : `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Fresh Grocery</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Fresh Grocery</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your trusted online grocery store</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px; color: #171717; font-size: 20px; font-weight: 600;">Welcome! Your account is confirmed.</h2>
              <p style="margin: 0 0 16px; color: #525252; font-size: 16px; line-height: 1.6;">
                Thank you for signing up at Fresh Grocery. Your account has been successfully created.
              </p>
              <p style="margin: 0 0 24px; color: #525252; font-size: 16px; line-height: 1.6;">
                You can now sign in and start shopping.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius: 8px; background-color: #16a34a;">
                    <a href="${appUrl}" style="display: inline-block; padding: 14px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Start Shopping</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafa; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; color: #737373; font-size: 13px; text-align: center;">
                © Fresh Grocery. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim();

    const { data, error } = await resend.emails.send({
      from: "Fresh Grocery <onboarding@resend.dev>",
      to: [email],
      subject: confirmationLink
        ? "Verify your email – Fresh Grocery"
        : "Welcome to Fresh Grocery – Account Confirmed",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Send confirmation email failed:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}
