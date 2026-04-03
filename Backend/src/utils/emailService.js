import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a confirmation email to the user when they submit a report.
 */
export const sendReportConfirmation = async (email, report) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Skipping confirmation email.");
    return;
  }

  const mailOptions = {
    from: `"LEIMS Official" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Incident Report Received - #${report.id}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #2c5e1a; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Report Received ✅</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">Thank you for reporting an incident. Your report has been successfully received and is currently being processed by the system.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2c5e1a;">
            <p style="margin: 0 0 10px 0;"><strong>Report ID:</strong> <span style="color: #2c5e1a;">#${report.id}</span></p>
            <p style="margin: 0 0 10px 0;"><strong>Department:</strong> ${report.department}</p>
            <p style="margin: 0 0 10px 0;"><strong>Description:</strong> ${report.description}</p>
            <p style="margin: 0;"><strong>Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #d4af37;">${report.status}</span></p>
          </div>
          
          <p style="font-size: 16px;">You can track the live status of your report anytime on your dashboard.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 14px; color: #777777;">
            <p style="margin: 0;">Regards,<br><strong>LEIMS Official Team</strong></p>
            <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
  }
};

/**
 * Sends an email to the user when the status of their report is updated.
 */
export const sendStatusUpdate = async (email, report, newStatus) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("Email credentials missing. Skipping status update email.");
    return;
  }

  const mailOptions = {
    from: `"LEIMS Official" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Status Update: Incident Report #${report.id}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #d4af37; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Status Updated 📢</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">The status of your incident report has been updated by the authorities.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #d4af37;">
            <p style="margin: 0 0 10px 0;"><strong>Report ID:</strong> <span style="color: #1a1a1a;">#${report.id}</span></p>
            <p style="margin: 0 0 10px 0;"><strong>Description:</strong> ${report.description}</p>
            <p style="margin: 0;"><strong>New Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #2c5e1a;">${newStatus.replace('_', ' ')}</span></p>
          </div>
          
          <p style="font-size: 16px;">Please log in to the LEIMS dashboard to view further details or take necessary actions.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eeeeee; font-size: 14px; color: #777777;">
            <p style="margin: 0;">Regards,<br><strong>LEIMS Official Team</strong></p>
            <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Status update email sent to ${email} (New Status: ${newStatus})`);
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
  }
};
