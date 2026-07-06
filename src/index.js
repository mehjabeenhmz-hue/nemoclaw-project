const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const { GoogleGenAI } = require('@google/genai');

// 🔐 Secure Way: Ab key direct code me nahi balki Render ke dashboard se load hogi
const MY_GEMINI_KEY = process.env.GEMINI_API_KEY; 

const ai = new GoogleGenAI({ apiKey: MY_GEMINI_KEY });

async function connectToWhatsApp() {
    console.log("Starting Real-Time AI Employee with Google Search Support...");
    
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if(qr) {
            console.log("\n--- APNA WHATSAPP SCAN KAREIN ---");
            qrcode.generate(qr, { small: true });
            console.log("---------------------------------\n");
        }
        if(connection === 'open') {
            console.log("Mubarak ho! AI Employee with Live Weather & Search is LIVE! 💼🌐");
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
            for (const msg of m.messages) {
                const from = msg.key.remoteJid;
                const isGroup = from.endsWith('@g.us');
                const isNewsletter = from.endsWith('@newsletter');

                if (!msg.key.fromMe && !isGroup && !isNewsletter && msg.message) {
                    const text = msg.message.conversation || 
                                 msg.message.extendedTextMessage?.text || "";
                    
                    if (text.trim().length > 0) {
                        console.log(`\n--- USER SENT A MESSAGE ---`);
                        console.log(`User Said: "${text}"`);
                        
                        console.log("AI Employee is thinking & searching...");
                        try {
                            const response = await ai.models.generateContent({
                                model: 'gemini-2.5-flash',
                                contents: text,
                                config: {
                                    tools: [{ googleSearch: {} }],
                                    systemInstruction: "You are a professional, smart human AI employee for a business. Reply naturally, intelligently, and dynamically to the user's message. Use Google Search tool automatically when asked about live information like weather, time, dates, or current info. Never output raw JSON. Always match the user's tone and reply in natural, friendly Roman Urdu or English. Keep responses concise like a real person chatting on WhatsApp."
                                }
                            });

                            const replyText = response.text;
                            
                            if (replyText && replyText.trim().length > 0) {
                                console.log(`AI Real Response: "${replyText}"`);
                                await sock.sendMessage(from, { text: String(replyText) });
                                console.log("Reply sent successfully!");
                            }

                        } catch (err) {
                            console.log(`❌ AI ERROR:`, err.message);
                            await sock.sendMessage(from, { text: "Main thodi der me check karke batata hoon!" });
                        }
                    }
                }
            }
        }
    });
}

connectToWhatsApp();