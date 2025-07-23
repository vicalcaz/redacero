// Vercel Serverless Function: /api/sendMail.js
// Usa Nodemailer con SMTP de Brevo (Sendinblue)
// 1. Instala nodemailer: npm install nodemailer
// 2. Crea variables de entorno en Vercel: BREVO_USER, BREVO_PASS

const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  // Configura el transporter con SMTP de Brevo
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.BREVO_USER,
      to,
      subject,
      html,
    });
    return res.status(200).json({ success: true, info });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
