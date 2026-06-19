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
      to: "info@selsoftinc.com", // Send to this email address
      replyTo: email,
      subject: `[Website Contact] ${subject} - from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #6836E1; margin-bottom: 20px;">New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <h3 style="color: #334155;">Message:</h3>
          <p style="color: #475569; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
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
