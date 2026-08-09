import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

/**
 * Configure Transporter
 * Works with Resend (smtp.resend.com), Google Workspace, Zoho, SendGrid, Mailgun, or standard cPanel/Custom SMTP.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.resend.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'resend';
  const pass = process.env.SMTP_PASS || process.env.RESEND_API_KEY || '';

  if (!pass) {
    console.warn('⚠️ No SMTP_PASS or RESEND_API_KEY configured in environment. Emails will be simulated in console.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 / other
    auth: {
      user,
      pass
    }
  });
};

// POST /api/email/send-ticket - Send ticket email with PDF attachment
router.post('/send-ticket', async (req, res) => {
  try {
    const { ticketData, pdfBase64 } = req.body;

    if (!ticketData || !ticketData.email) {
      return res.status(400).json({ success: false, message: 'Missing ticket data or customer email address' });
    }

    const recipientEmail = ticketData.email.trim();
    const pnr = ticketData.bookingReference || ticketData.ticketNumber || 'PNR-TICKET';
    const passengerName = `${ticketData.firstName || ''} ${ticketData.lastName || ''}`.trim() || 'Valued Passenger';
    const departure = ticketData.flightDetails?.departure?.departure?.city || ticketData.departure || 'Origin';
    const destination = ticketData.flightDetails?.departure?.arrival?.city || ticketData.destination || 'Destination';
    const defaultSender = (process.env.SMTP_HOST || 'smtp.resend.com').includes('resend') 
      ? 'onboarding@resend.dev' 
      : 'tickets@skydummy.com';
    const senderEmail = process.env.SENDER_EMAIL || defaultSender;
    const senderName = process.env.SENDER_NAME || 'SkyDummy Flight Reservations';

    console.log(`📧 Attempting to send automated ticket PDF email to: ${recipientEmail} for PNR: ${pnr}`);

    // Generate HTML Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: #003366; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
          .content { padding: 28px 24px; }
          .pnr-box { background: #f0f7ff; border: 1px dashed #0056b3; border-radius: 6px; padding: 16px; text-align: center; margin-bottom: 24px; }
          .pnr-label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; letter-spacing: 1px; }
          .pnr-value { font-size: 24px; font-weight: bold; color: #003366; margin-top: 4px; font-family: monospace; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .info-table td { padding: 10px 0; border-bottom: 1px solid #edf2f7; font-size: 14px; }
          .info-table td.label { color: #718096; width: 40%; font-weight: 500; }
          .info-table td.value { color: #1a202c; font-weight: 600; text-align: right; }
          .status-badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 12px; }
          .promo-box { background: #fffbe3; border: 1px solid #ffe58f; padding: 16px; border-radius: 6px; margin-top: 24px; text-align: center; }
          .promo-code { font-size: 18px; font-weight: bold; color: #d48806; margin-top: 4px; letter-spacing: 2px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✈️ Flight Ticket Confirmed</h1>
            <p>Thank you for choosing SkyDummy. Your ticket PDF is attached!</p>
          </div>
          <div class="content">
            <p>Dear <strong>${passengerName}</strong>,</p>
            <p>Your dummy flight reservation for visa/travel application has been processed successfully.</p>
            
            <div class="pnr-box">
              <div class="pnr-label">Booking Reference / PNR</div>
              <div class="pnr-value">${pnr}</div>
            </div>

            <table class="info-table">
              <tr>
                <td class="label">Passenger Name</td>
                <td class="value">${passengerName}</td>
              </tr>
              <tr>
                <td class="label">Route</td>
                <td class="value">${departure} ➔ ${destination}</td>
              </tr>
              <tr>
                <td class="label">Trip Type</td>
                <td class="value" style="text-transform: capitalize;">${ticketData.tripType || 'One Way'}</td>
              </tr>
              <tr>
                <td class="label">Passport Number</td>
                <td class="value">${ticketData.passport || 'N/A'}</td>
              </tr>
              <tr>
                <td class="label">Booking Status</td>
                <td class="value"><span class="status-badge">✓ CONFIRMED</span></td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #4a5568; line-height: 1.5;">
              📎 <strong>PDF Ticket Attached:</strong> We have attached your official PDF flight itinerary to this email. You can present or print this PDF directly for visa applications and immigration checks.
            </p>

            <div class="promo-box">
              <div style="font-size: 12px; color: #8c6b00; font-weight: bold;">🎉 Special Offer For Your Next Booking</div>
              <div class="promo-code">PROMO CODE: SKY10</div>
              <div style="font-size: 11px; color: #8c6b00; margin-top: 4px;">Enjoy 10% OFF your next ticket generation!</div>
            </div>
          </div>
          <div class="footer">
            <p>SkyDummy Flight Services • Official Visa Itinerary Generator</p>
            <p>This document is generated for visa application purposes.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = getTransporter();

    // Attachments handling if PDF base64 provided
    const attachments = [];
    if (pdfBase64) {
      // Remove data URI header if present
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      attachments.push({
        filename: `SkyDummy_Ticket_${pnr}.pdf`,
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf'
      });
    }

    if (!transporter) {
      // If no SMTP credentials configured yet, simulate successful log and inform UI
      console.log(`[Email Simulation] ✉️ Email would be sent to: ${recipientEmail} from ${senderEmail}`);
      return res.json({
        success: true,
        simulated: true,
        message: `Automated email simulated for ${recipientEmail}. Configure SMTP_PASS or RESEND_API_KEY in .env for live dispatch.`,
        pnr,
        recipient: recipientEmail
      });
    }

    // Send live email via SMTP / Resend
    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientEmail,
      subject: `✈️ Your Flight Ticket & Itinerary [PNR: ${pnr}]`,
      html: htmlContent,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${recipientEmail}! Message ID: ${info.messageId}`);

    return res.json({
      success: true,
      simulated: false,
      messageId: info.messageId,
      message: `Ticket PDF email sent successfully to ${recipientEmail}`,
      pnr,
      recipient: recipientEmail
    });

  } catch (error) {
    console.error('❌ Error in /api/email/send-ticket route:', error);
    let userMsg = error.message || 'Failed to send ticket email';
    if (userMsg.includes('550') || userMsg.includes('verify your domain')) {
      userMsg = 'Domain verification required by email provider. Set SENDER_EMAIL in .env or verify your domain in Resend.';
    }
    return res.status(200).json({
      success: false,
      message: userMsg,
      errorDetail: error.message
    });
  }
});

export default router;
