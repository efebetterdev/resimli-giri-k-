const ascii = require('ascii-table');
const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');

function loadEvents(client) {
    const table = new ascii().setHeading('Events', 'Status');

    // Events klasörünü oku
    const folders = fs.readdirSync(path.join(__dirname, '../Events'));

    for (const folder of folders) {
        // Her klasördeki .js dosyalarını filtrele
        const files = fs.readdirSync(path.join(__dirname, `../Events/${folder}`))
            .filter(file => file.endsWith('.js'));

        for (const file of files) {
            // Event dosyasını al
            const event = require(path.join(__dirname, `../Events/${folder}/${file}`));

            // Event türüne göre uygun event handler'ı kullan
            if (event.rest) {
                // REST API events
                if (event.once) {
                    client.rest.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.rest.on(event.name, (...args) => event.execute(...args, client));
                }
            } else {
                // Discord.js client events
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
            }

            table.addRow(file, 'loaded');
        }
    }

    // Yüklenen eventleri logla
    console.log(table.toString(), '\nLoaded events');
}

// Kayıt etkileşimlerini işlemek için handleInteraction fonksiyonu
async function handleInteraction(interaction) {
    if (interaction.isButton()) {
        const userId = interaction.user.id;
        const interactionId = interaction.customId;

        // Kullanıcının kayıt bilgilerini almak için bir JSON dosyası kullanabiliriz
        const dataPath = path.join(__dirname, '../data/registration.json');
        let registrationData = {};

        try {
            registrationData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        } catch (error) {
            console.warn('Registration data file not found or corrupted, creating a new one.');
        }

        // Kullanıcı verilerini saklayın
        if (!registrationData[userId]) {
            registrationData[userId] = {
                username: null,
                email: null,
                password: null,
                age: null,
            };
        }

        switch (interactionId) {
            case 'register_username':
                await interaction.reply('Lütfen kullanıcı adınızı yazın:');
                registrationData[userId].username = await collectResponse(interaction.user, 'username');
                break;
            case 'register_email':
                await interaction.reply('Lütfen e-posta adresinizi yazın:');
                registrationData[userId].email = await collectResponse(interaction.user, 'email');
                break;
            case 'register_password':
                await interaction.reply('Lütfen şifrenizi yazın:');
                registrationData[userId].password = await collectResponse(interaction.user, 'password');
                break;
            case 'register_age':
                await interaction.reply('Lütfen yaşınızı yazın:');
                const age = await collectResponse(interaction.user, 'age');
                if (parseInt(age) < 12) {
                    await interaction.user.send('12 yaşından büyük olmanız gerekmektedir.');
                    return;
                }
                registrationData[userId].age = age;
                break;
            default:
                break;
        }

        // Kayıt verilerini JSON dosyasına yaz
        fs.writeFileSync(dataPath, JSON.stringify(registrationData, null, 2));
        await interaction.followUp('Bilgileriniz başarıyla alındı!');
    }
}

// Yardımcı işlev, kullanıcıdan yanıt toplamak için
async function collectResponse(user, field) {
    // Kullanıcıdan yanıt almak için mesajları dinleyin
    return new Promise((resolve, reject) => {
        const filter = m => m.author.id === user.id;
        const collector = user.dmChannel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', m => {
            collector.stop();
            resolve(m.content);
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                reject(new Error('Yanıt alınamadı.'));
            }
        });
    });
}

module.exports = { loadEvents, handleInteraction };
