import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.GMAIL_SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.GMAIL_SMTP_USERNAME,
        pass: process.env.GMAIL_SMTP_PASSWORD,
      },
    });

    const fromEmail = process.env.GMAIL_FROM_EMAIL || process.env.GMAIL_SMTP_USERNAME;
    const fromName = process.env.GMAIL_FROM_NAME || "Wyrefy";

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: "sibi@selsoftinc.com", // Send to this email address
      replyTo: email,
      subject: `[Website Contact] ${subject} - from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #6836E1 0%, #8A58FF 100%); padding: 32px 40px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
            .header p { color: #e0e7ff; margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 40px; }
            .field { margin-bottom: 24px; }
            .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
            .value { font-size: 16px; color: #0f172a; background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #6836E1; }
            .message-box { font-size: 15px; color: #334155; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.7; white-space: pre-wrap; margin-top: 8px; }
            .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
            <tr>
              <td align="center">
                <table class="container" width="600" cellpadding="0" cellspacing="0" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td class="header" style="background: linear-gradient(135deg, #6836E1 0%, #8A58FF 100%); padding: 32px 40px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">Wyrefy</h1>
                      <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 14px;">New Contact Form Submission</p>
                    </td>
                  </tr>
                  <tr>
                    <td class="content" style="padding: 40px;">
                      <div class="field" style="margin-bottom: 24px;">
                        <div class="label" style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Sender Name</div>
                        <div class="value" style="font-size: 16px; color: #0f172a; background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #6836E1;">${name}</div>
                      </div>
                      <div class="field" style="margin-bottom: 24px;">
                        <div class="label" style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Email Address</div>
                        <div class="value" style="font-size: 16px; color: #0f172a; background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #6836E1;"><a href="mailto:${email}" style="color: #6836E1; text-decoration: none; font-weight: 600;">${email}</a></div>
                      </div>
                      <div class="field" style="margin-bottom: 24px;">
                        <div class="label" style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Subject</div>
                        <div class="value" style="font-size: 16px; color: #0f172a; background-color: #f1f5f9; padding: 14px 18px; border-radius: 8px; border-left: 4px solid #10b981;">${subject}</div>
                      </div>
                      <div class="field" style="margin-bottom: 24px;">
                        <div class="label" style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Message Content</div>
                        <div class="message-box" style="font-size: 15px; color: #334155; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; line-height: 1.7; white-space: pre-wrap;">${message}</div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="footer" style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0;">
                      This email was sent automatically from the Wyrefy Landing Page contact form.<br/>
                      Reply directly to this email to respond to <strong>${name}</strong>.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending contact email:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
