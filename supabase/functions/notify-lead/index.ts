Deno.serve(async request => {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const recipient = Deno.env.get('CONTACT_NOTIFICATION_EMAIL');
    const sender = Deno.env.get('RESEND_FROM_EMAIL');
    const webhookSecret = Deno.env.get('LEAD_WEBHOOK_SECRET');

    if (!resendApiKey || !recipient || !sender || !webhookSecret) {
        console.error('Email notification secrets are not configured.');
        return Response.json({ error: 'Email notifications are not configured.' }, { status: 503 });
    }

    try {
        const providedSecret = request.headers.get('x-lead-webhook-secret') || '';
        const encoder = new TextEncoder();
        const [providedHash, expectedHash] = await Promise.all([
            crypto.subtle.digest('SHA-256', encoder.encode(providedSecret)),
            crypto.subtle.digest('SHA-256', encoder.encode(webhookSecret))
        ]);
        const providedBytes = new Uint8Array(providedHash);
        const expectedBytes = new Uint8Array(expectedHash);
        let secretMatches = 0;
        for (let index = 0; index < providedBytes.length; index += 1) {
            secretMatches |= providedBytes[index] ^ expectedBytes[index];
        }
        if (!providedSecret || secretMatches !== 0) {
            return Response.json({ error: 'Unauthorized webhook.' }, { status: 401 });
        }

        const event = await request.json();
        if (event.type !== 'INSERT' || event.table !== 'leads' || event.schema !== 'public' || !event.record) {
            return Response.json({ error: 'Unsupported database event.' }, { status: 400 });
        }

        const lead = event.record;
        const email = String(lead.email || lead.client_email || '').trim().slice(0, 254);
        const phone = String(lead.phone || lead.client_phone || '').trim().slice(0, 64);
        const clientName = String(lead.name || lead.client_name || '').trim().slice(0, 160);
        const subject = String(lead.subject || 'Demande générale').trim().slice(0, 160);
        const message = String(lead.message || '').trim().slice(0, 5000);

        if (!clientName || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return Response.json({ error: 'Invalid lead details.' }, { status: 400 });
        }

        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: sender,
                to: [recipient],
                reply_to: email,
                subject: `Nouvelle demande SIMEL : ${subject}`,
                text: [
                    `Nom : ${clientName}`,
                    `E-mail : ${email}`,
                    `Téléphone : ${phone || 'Non renseigné'}`,
                    `Sujet : ${subject}`,
                    '',
                    'Message :',
                    message
                ].join('\n')
            })
        });

        if (!emailResponse.ok) {
            const details = await emailResponse.text();
            console.error('Resend rejected the notification:', details);
            return Response.json({ error: 'The email notification could not be sent.' }, { status: 502 });
        }

        return Response.json({ success: true });
    } catch (error) {
        console.error('Invalid notification request:', error);
        return Response.json({ error: 'Invalid notification request.' }, { status: 400 });
    }
});
