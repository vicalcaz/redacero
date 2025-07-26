// Vercel Serverless Function: /api/sendMail.mjs
// Usa Nodemailer con SMTP de Red Acero
// 1. Instala nodemailer: npm install nodemailer
// 2. Crea variables de entorno en Vercel: SMTP_USER, SMTP_PASS, SMTP_FROM

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  // Configura el transporter con SMTP de la red acero
  const transporter = nodemailer.createTransport({
    host: 'smtp.redacero.com.ar',
    port: 225, // Cambia el puerto si tu proveedor indica otro (ej: 465 para SSL)
    secure: false, // true si usas SSL (puerto 465)
    auth: {
      user: process.env.SMTP_USER || 'encuentro2025@redacero.com.ar',
      pass: process.env.SMTP_PASS || 'Encuentro2025!'
    },
  });

  try {
    // Verifica la conexión SMTP antes de enviar
    await transporter.verify();
    // Si la conexión es exitosa, responde primero
    res.write(JSON.stringify({ message: 'Conexión SMTP exitosa. Enviando mail...' }));
    // Envía el mail
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'encuentro2025@redacero.com.ar',
      to,
      subject,
      html,
    });
    // Finaliza la respuesta con el resultado del envío
    res.end(JSON.stringify({ success: true, info }));
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
