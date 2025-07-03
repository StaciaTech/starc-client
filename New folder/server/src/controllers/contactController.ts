import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

/**
 * @desc    Send email from contact form
 * @route   POST /api/contact
 * @access  Public
 */
export const sendContactEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, recipientEmail } = req.body;

    // Validate request
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, subject and message'
      });
    }

    // Email options
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: recipientEmail || process.env.CONTACT_EMAIL || 'contact@edifai.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Thank you for contacting us',
      html: `
        <h3>Thank you for your inquiry</h3>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p>Here's a copy of your message:</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p>Best regards,</p>
        <p>The Edifai Team</p>
      `
    };

    await transporter.sendMail(confirmationMailOptions);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Email could not be sent',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/contact/subscribe
 * @access  Public
 */
export const subscribeToNewsletter = async (req: Request, res: Response) => {
  try {
    const { email, name = 'Subscriber', recipientEmail } = req.body;

    // Validate request
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Email options for notification to admin
    const mailOptions = {
      from: `"Edifai Newsletter" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: recipientEmail || process.env.CONTACT_EMAIL || 'contact@edifai.com',
      subject: '🔔 New Newsletter Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px; background-color: #8A63FF; padding: 15px; border-radius: 5px;">
            <h2 style="color: white; margin: 0;">New Newsletter Subscription</h2>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">A new user has subscribed to your newsletter.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Subscriber Details:</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Time (UTC):</strong> ${new Date().toUTCString()}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.5;">A welcome email has been automatically sent to the subscriber.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>© ${new Date().getFullYear()} Edifai Newsletter System</p>
          </div>
        </div>
      `
    };

    // Send welcome email to subscriber first to ensure they get it
    try {
      const welcomeMailOptions = {
        from: `"Edifai Team" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
        to: email,
        subject: 'Welcome to Edifai Newsletter! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="text-align: center; margin-bottom: 20px; background-color: #8A63FF; padding: 20px; border-radius: 5px;">
              <h1 style="color: white; margin: 0;">Welcome to Edifai Newsletter!</h1>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5;">Dear ${name},</p>
            
            <p style="font-size: 16px; line-height: 1.5;">Thank you for subscribing to our newsletter. We're excited to have you join our community!</p>
            
            <p style="font-size: 16px; line-height: 1.5;">You'll now receive updates about:</p>
            
            <ul style="padding-left: 20px; font-size: 16px; line-height: 1.5;">
              <li>New courses and learning opportunities</li>
              <li>Educational resources and tips</li>
              <li>Industry insights and trends</li>
              <li>Special offers and promotions</li>
            </ul>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px; line-height: 1.5;"><strong>Quick Tip:</strong> Add <a href="mailto:${process.env.EMAIL_USER || 'your-email@gmail.com'}" style="color: #8A63FF; text-decoration: none;">${process.env.EMAIL_USER || 'your-email@gmail.com'}</a> to your contacts to ensure our emails reach your inbox.</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5;">If you have any questions or need assistance, feel free to contact us at <a href="mailto:${process.env.CONTACT_EMAIL || 'contact@edifai.com'}" style="color: #8A63FF; text-decoration: none;">${process.env.CONTACT_EMAIL || 'contact@edifai.com'}</a>.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://edifai.in" style="background-color: #8A63FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Our Website</a>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; margin-top: 30px;">Best regards,<br>The Edifai Team</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
              <p>© ${new Date().getFullYear()} Edifai. All rights reserved.</p>
              <p>If you didn't subscribe to this newsletter, please ignore this email.</p>
            </div>
          </div>
        `
      };

      console.log(`Attempting to send welcome email to: ${email}`);
      const welcomeResult = await transporter.sendMail(welcomeMailOptions);
      console.log('Welcome email sent successfully:', welcomeResult.messageId);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue with the process even if welcome email fails
    }

    // Then send notification to admin
    try {
      console.log(`Sending admin notification about new subscriber: ${email}`);
      const notifyResult = await transporter.sendMail(mailOptions);
      console.log('Admin notification sent successfully:', notifyResult.messageId);
    } catch (notifyError) {
      console.error('Error sending admin notification:', notifyError);
      // Continue with the process even if admin notification fails
    }

    res.status(200).json({
      success: true,
      message: 'Subscription successful'
    });
  } catch (error) {
    console.error('Error processing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription could not be processed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 