const { google } = require('googleapis')

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
)

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
})

const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

// Verify email server on startup
oauth2Client.getAccessToken()
  .then(() => {
    console.log('Email server is ready to send messages')
  })
  .catch((error) => {
    console.error('Error connecting to email server:', error)
  })

const sendEmail = async (to, subject, html) => {
  try {
    const message = [
      `From: "res AI" <${process.env.EMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html
    ].join('\n')

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage }
    })

    console.log('Email sent:', res.data.id)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

async function sendOTPEmail(email, otp) {
  await sendEmail(
    email,
    "Verify your res AI account",
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2>Verify your email</h2>
      <p>Your OTP for registration is:</p>
      <h1 style="letter-spacing:8px;color:#c9a84c;background:#1a1400;padding:16px;border-radius:8px;text-align:center">${otp}</h1>
      <p>This OTP expires in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, ignore this email.</p>
      <p>Best regards,<br><strong>The res AI Team</strong></p>
    </div>
    `
  )
}

async function sendRegistrationEmail(email, fullname,) {
  await sendEmail(
    email,
    'Welcome to res AI! Your Account Details',
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2>Hello ${fullname},</h2>
      <p>Welcome to <strong>res AI</strong>! Your account has been created successfully.</p>
      
      <br>
      <p>Best regards,<br><strong>The res AI Team</strong></p>
    </div>
    `
  )
}
async function sendLoginEmail(email, fullname) {
  await sendEmail(
    email,
    'New Login Alert',
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2>Hello ${fullname},</h2>
      <p>We noticed a new login to your account.</p>
      <p>If this was you, you can safely ignore this email.</p>
      <p>If you suspect any unauthorized access, please change your password immediately.</p>
      <p>Best regards,<br><strong>The res AI Team</strong></p>
    </div>
    `
  )
}
async function sendPasswordResetEmail(email, fullname) {
  await sendEmail(
    email,
    "Your Password Has Been Reset",
    `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2>Hello ${fullname},</h2>
      <p>Your password for <strong>res AI</strong> has been reset successfully.</p>
      <p>If you did not request this change, please contact us immediately.</p>
      <br>
      <p>Best regards,<br><strong>The res AI Team</strong></p>
    </div>
    `
  )
}

module.exports = { sendOTPEmail, sendRegistrationEmail, sendLoginEmail ,sendPasswordResetEmail}