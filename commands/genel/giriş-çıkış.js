const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb'); // croxydb ile kanal verilerini saklamak için

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resimli-welcome')
        .setDescription('Giriş ve çıkış mesajı kanallarını, arka plan resmini ayarla veya sıfırla.')
        .addStringOption(option =>
            option.setName('işlem')
                .setDescription('Yapılacak işlem: "ayarla" veya "sıfırla".')
                .setRequired(true)
                .addChoices(
                    { name: 'ayarla', value: 'ayarla' },
                    { name: 'sıfırla', value: 'sıfırla' }
                ))
        .addChannelOption(option =>
            option.setName('giriş-kanal')
                .setDescription('Giriş mesajlarının gönderileceği kanal.')
                .setRequired(false)) // Giriş kanalı opsiyonel
        .addChannelOption(option =>
            option.setName('çıkış-kanal')
                .setDescription('Çıkış mesajlarının gönderileceği kanal.')
                .setRequired(false)) // Çıkış kanalı opsiyonel
        .addStringOption(option =>
            option.setName('arka-plan')
                .setDescription('Giriş ve çıkış mesajları için kullanılacak arka plan resmi URL\'si.')
                .setRequired(false)), // Arka plan opsiyonel
    async execute(interaction) {
        // Yetki kontrolü
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'Bu komutu kullanmak için yeterli yetkiniz yok!', ephemeral: true });
        }

        const işlem = interaction.options.getString('işlem');
        const girişKanal = interaction.options.getChannel('giriş-kanal');
        const çıkışKanal = interaction.options.getChannel('çıkış-kanal');
        const arkaPlanUrl = interaction.options.getString('arka-plan'); // Arka plan URL'si

        if (işlem === 'ayarla') {
            // Giriş ve çıkış kanallarını ayarlama
            if (!girişKanal || !çıkışKanal) {
                return interaction.reply({ content: 'Giriş ve çıkış kanallarını belirtmelisiniz!', ephemeral: true });
            }

            // Veritabanına kayıt
            db.set(`girişKanal_${interaction.guild.id}`, girişKanal.id);
            db.set(`çıkışKanal_${interaction.guild.id}`, çıkışKanal.id);

            // Embed yapısını oluştur
            const embedMessage = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Giriş/Çıkış Mesajı Ayarları')
                .setDescription(`Giriş kanalı ${girişKanal} ve çıkış kanalı ${çıkışKanal} olarak ayarlandı.`);

            // Eğer arka plan URL'si sağlanmışsa, arka plan olarak ekle
            if (arkaPlanUrl) {
                embedMessage.setImage(arkaPlanUrl); // Arka plan görseli olarak eklenir
                db.set(`arkaPlan_${interaction.guild.id}`, arkaPlanUrl); // Arka planı veritabanına kaydet
                await interaction.reply({ content: 'Giriş ve çıkış kanalları ayarlandı!', embeds: [embedMessage] });
            } else {
                await interaction.reply({ content: 'Giriş ve çıkış kanalları ayarlandı. Arka plan resmi kullanılmadı.', embeds: [embedMessage] });
            }
        } else if (işlem === 'sıfırla') {
            // Giriş ve çıkış kanallarını sıfırlama
            db.delete(`girişKanal_${interaction.guild.id}`);
            db.delete(`çıkışKanal_${interaction.guild.id}`);
            db.delete(`arkaPlan_${interaction.guild.id}`);

            const resetEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Giriş/Çıkış Mesajı Ayarları Sıfırlandı')
                .setDescription('Giriş kanalı, çıkış kanalı ve arka plan resmi sıfırlandı.');

            await interaction.reply({ content: 'Giriş ve çıkış kanalları sıfırlandı!', embeds: [resetEmbed] });
        }
    },
};
