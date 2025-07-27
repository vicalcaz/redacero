// Vercel Serverless Function: /api/sendMail.mjs
// Usa Nodemailer con SMTP de Red Acero
// 1. Instala nodemailer: npm install nodemailer
// 2. Crea variables de entorno en Vercel: SMTP_USER, SMTP_PASS, SMTP_FROM


// Requiere: npm install resend
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  // Usa la API de Resend
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM || 'onboarding@resend.dev', // Usa el from de prueba para descartar problemas de dominio
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
