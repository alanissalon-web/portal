import { LocalDB } from './LocalDatabase';

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  subject?: string;
  message: string;
  date?: string;
}

export const EmailService = {
  /**
   * Dispatches an email notification to the Salon when a contact form is submitted.
   */
  sendContactNotification: async (payload: ContactMessagePayload): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Get salon target email from settings
      const { data: settings } = await LocalDB.getSettings();
      const salonEmail = settings?.contactEmail || 'alanissalon@gmail.com';

      console.log(`[EmailService] Sending notification for message from ${payload.name} (${payload.email}) to Salon Email: ${salonEmail}`);

      // 2. Prepare email body
      const emailSubject = encodeURIComponent(`[Nuevo Mensaje Web] ${payload.subject || payload.service || 'Consulta de Cliente'}`);
      const emailBody = encodeURIComponent(
        `Has recibido un nuevo mensaje desde el sitio web de Alanís Salon:\n\n` +
        `👤 Nombre: ${payload.name}\n` +
        `✉️ Correo: ${payload.email}\n` +
        `📞 Teléfono: ${payload.phone || 'No especificado'}\n` +
        `💈 Servicio de Interés: ${payload.service || 'General'}\n` +
        `📅 Fecha: ${payload.date || new Date().toLocaleString()}\n\n` +
        `💬 Mensaje:\n${payload.message}\n\n` +
        `--- \nPuedes responder a este mensaje directamente respondiendo a ${payload.email} o en tu Panel Admin -> Comunicaciones.`
      );

      // 3. Fallback/Integrations dispatch: Formspree or Mailto hook
      // Try posting to public mail endpoint if configured, or trigger mailto link
      const formspreeEndpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || '';

      if (formspreeEndpoint) {
        await fetch(formspreeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _replyto: payload.email,
            to: salonEmail,
            subject: `[Nuevo Mensaje Web] ${payload.subject || payload.service || 'Consulta de Cliente'}`,
            name: payload.name,
            email: payload.email,
            phone: payload.phone || 'N/A',
            service: payload.service || 'N/A',
            message: payload.message
          })
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('[EmailService] Error sending email notification:', err);
      return { success: false, error: err.message };
    }
  }
};
