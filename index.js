const qrcode = require('qrcode');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
require('dotenv').config();
const axios = require('axios');
const moment = require('moment');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-gpu"
        ]
    }
});

client.on('qr', qr => {
    qrcode.toDataURL(qr, (err, url) => {
        if (err) {
            console.error('Failed to generate QR code:', err);
        } else {
            console.log('Scan this QR by opening this link in your browser:');
            console.log(url);
        }
    });
});

client.on('ready', () => {
    console.log('DushBot is ready!');
});

client.on('message', async msg => {
    const text = msg.body.toLowerCase();
    const greetings = ['hi', 'hello', 'hii', 'hey', 'yo', 'yoo', 'hiii'];

    if (greetings.includes(text)) {
        return msg.reply('Hey there! I’m DushBot — how can I help you? Type *menu* to see commands.');
    }

    if (text === 'menu') {
        return msg.reply(`*DushBot Commands:*
- hi / hello → Greetings
- time → Get current time
- !yt <url> → Download YouTube audio
- !song <name> → Get a song
- view-once → Unlock view-once media
- More features coming soon!`);
    }

    if (text === 'time') {
        return msg.reply('Current time: ' + moment().format('LLLL'));
    }

    if (text.startsWith('!yt ')) {
        return msg.reply('Feature coming soon: YouTube download support.');
    }

    if (!text.startsWith('!')) {
        return msg.reply('Hmm... I’m still learning! Try typing *menu* to see what I can do.');
    }
});

client.on('message_revoke_everyone', async (after, before) => {
    if (before) {
        const chat = await before.getChat();
        chat.sendMessage(`Anti-Delete:
User deleted: ${before.author || before.from}
Message: ${before.body}`);
    }
});

client.on('message', async message => {
    if (message.hasMedia && message.isViewOnce) {
        const media = await message.downloadMedia();
        if (media) {
            await message.reply(media);
        }
    }
});

client.on('chat_opened', async chat => {
    chat.sendStateTyping();
    setTimeout(() => chat.clearState(), 2000);
});

client.initialize();