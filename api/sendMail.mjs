// Vercel Serverless Function: /api/sendMail.mjs
// Usa Nodemailer con SMTP de Red Acero
// 1. Instala nodemailer: npm install nodemailer
// 2. Crea variables de entorno en Vercel: SMTP_USER, SMTP_PASS, SMTP_FROM



// Requiere: npm install resend nodemailer
import { Resend } from 'resend';
import nodemailer from 'nodemailer';


// Genera un link de login con email y contraseña (espacio vacío)
function generarLinkLogin(email) {
  const baseUrl = 'https://redacero.vercel.app/login';
  const params = new URLSearchParams({
    email,
    password: ' '
  });
  return `${baseUrl}?${params.toString()}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  // Selección de proveedor por variable de entorno
  const provider = process.env.MAIL_PROVIDER || 'RESEND';

  if (provider === 'GMAIL') {
    // Enviar con Gmail SMTP usando Nodemailer
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = process.env.GMAIL_PASS;
    if (!GMAIL_USER || !GMAIL_PASS) {
      return res.status(500).json({ error: 'Faltan credenciales de Gmail (GMAIL_USER, GMAIL_PASS)' });
    }
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_PASS,
        },
      });
      const mailOptions = {
        from: `Red Acero <${GMAIL_USER}>`,
        to,
        subject,
        html,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('Mail enviado con Gmail:', info.messageId);
      return res.status(200).json({ success: true, info });
    } catch (error) {
      console.error('Error Gmail:', error);
      return res.status(500).json({ error: error.message, details: error });
    }
  } else {
    // Usa la API de Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      const data = await resend.emails.send({
        from: process.env.RESEND_FROM || "Encuentro Red Acero 2025 <onboarding@resend.dev>",
        to,
        subject,
        html,
      });
      console.log('Respuesta de Resend:', data);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error Resend:', error);
      return res.status(500).json({ error: error.message, details: error });
    }
  }
}
