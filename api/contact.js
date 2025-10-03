export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, service, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Email no válido' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: '[Ptt]Stack Web', email: 'patripetete14@gmail.com' },
        to: [{ email: 'patripetete14@gmail.com', name: 'Patricio García' }],
        replyTo: { email, name },
        subject: `[PttStack.dev] Nuevo contacto — ${service || 'Consulta general'}`,
        htmlContent: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111">
            <h2 style="color:#6366f1;margin-bottom:1.5rem">📬 Nuevo mensaje desde pttstack.dev</h2>
            <table style="width:100%;border-collapse:collapse;font-size:15px">
              <tr style="background:#f5f5f5">
                <td style="padding:10px 14px;font-weight:600;width:120px">Nombre</td>
                <td style="padding:10px 14px">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600">Email</td>
                <td style="padding:10px 14px"><a href="mailto:${email}" style="color:#6366f1">${email}</a></td>
              </tr>
              <tr style="background:#f5f5f5">
                <td style="padding:10px 14px;font-weight:600">Servicio</td>
                <td style="padding:10px 14px">${service || '—'}</td>
              </tr>
            </table>
            <h3 style="color:#6366f1;margin-top:1.5rem">Mensaje</h3>
            <p style="white-space:pre-wrap;background:#f9f9f9;padding:1rem;border-left:3px solid #6366f1;border-radius:4px">${message}</p>
            <p style="font-size:12px;color:#999;margin-top:2rem">
              Enviado desde pttstack.dev · Responde a este correo para contactar directamente con ${name}
            </p>
          </div>
        `
      })
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ ok: true });
    } else {
      console.error('[Brevo] Error:', data);
      return res.status(response.status).json({ error: data.message || 'Error al enviar' });
    }
  } catch (err) {
    console.error('[Contact] Exception:', err.message);
    return res.status(500).json({ error: 'Error del servidor' });
  }
}
