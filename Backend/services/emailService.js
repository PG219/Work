import nodemailer from 'nodemailer';
import 'dotenv/config'; // Ensures process.env variables are loaded

// --- Nodemailer (Gmail) Setup ---
// This 'transporter' is the object that can send emails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address from .env
    pass: process.env.GMAIL_APP_PASSWORD, // Your Google App Password from .env
  },
});

// Optional: Verify connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("Error connecting to Gmail SMTP:", error);
  } else {
    console.log("Gmail SMTP Server is ready to take messages");
  }
});

/**
 * Sends a contact form notification email.
 * @param {object} contactData
 * @param {string} contactData.name - Sender's name
 * @param {string} contactData.email - Sender's email
 * @param {string} contactData.inquiryType - Type of inquiry
 * @param {string} contactData.message - The message content
 */
export const sendContactNotification = async ({ name, email, inquiryType, message }) => {
  const mailOptions = {
    from: `"Your Site Name" <${process.env.GMAIL_USER}>`,
    
    // This is your email address, where you want to receive the notification
    to: process.env.CONTACT_RECEIVER, // TODO: Move this to .env as well?
    
    // Reply-to the person who filled out the form
    replyTo: email,
    
    subject: `New Contact Form Submission from ${name}`,
    
    // Plain text version
    text: `You received a new message from:
           Name: ${name}
           Email: ${email}
           Inquiry Type: ${inquiryType}
           Message:
           ${message}`,
    
    // HTML version
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2>New Contact Form Submission</h2>
        <p>You received a new message from your website's contact form.</p>
        <hr>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
        <h3>Message:</h3>
        <p style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully via Gmail.');
    return true; // Indicate success
  } catch (error) {
    console.error('Error sending email notification:', error);
    throw new Error('Failed to send email notification.'); // Propagate error
  }
};
