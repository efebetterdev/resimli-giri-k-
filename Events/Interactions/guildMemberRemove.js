const { WelcomeLeave } = require('canvafy');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    try {
      console.log(`Üye ayrıldı: ${member.user.tag}`);

      // Çıkış kanalı ID'sini veritabanından al
      const çıkışKanalId = db.get(`çıkışKanal_${member.guild.id}`);
      const çıkışKanal = member.guild.channels.cache.get(çıkışKanalId);

      if (!çıkışKanal) {
        console.warn(`Çıkış kanalı ayarlanmamış: ${member.guild.name}`);
        return;
      }

      // Arka plan URL'sini ve çıkış mesajını veritabanından al
      const varsayılanArkaPlan = 'https://r.resimlink.com/QxSaz15M.jpeg';
      const arkaPlanUrl = db.get(`arkaPlan_${member.guild.id}`) || varsayılanArkaPlan;
      const varsayılanMesaj = '{username}, sunucudan ayrıldı. Seni asla unutmayacağız!';
      const çıkışMesajı = db.get(`çıkışMesaj_${member.guild.id}`) || varsayılanMesaj;

      // Çıkış görseli oluştur
      const leaveImage = await new WelcomeLeave()
        .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
        .setBackground('image', arkaPlanUrl)
        .setTitle(`Elveda ${member.user.username}`.slice(0, 20))
        .setDescription('Sunucumuzda yerin hep dolmayacak...')
        .setBorder('#ff7f50')
        .setAvatarBorder('#ff4500')
        .setOverlayOpacity(0.7)
        .build();

      // Görseli dosya ekine dönüştür
      const attachment = new AttachmentBuilder(leaveImage, { name: 'leave.png' });

      // Embed oluştur
      const embed = new EmbedBuilder()
        .setColor('#FF4500')
        .setTitle('Sunucumuzdan Bir Yıldız Ayrıldı')
        .setDescription(
          çıkışMesajı.replace('{username}', member.user.username) +
            `\nŞu anki üye sayımız: **${member.guild.memberCount}**`
        )
        .setThumbnail(member.user.displayAvatarURL({ extension: 'png', size: 512 }))
        .setImage('attachment://leave.png')
        .setTimestamp()
        .setFooter({
          text: `${member.guild.name} | Seni Özleyeceğiz!`,
          iconURL: member.guild.iconURL({ dynamic: true }),
        });

      // Çıkış mesajını gönder
      await çıkışKanal.send({
        embeds: [embed],
        files: [attachment],
      });

      console.log(`Çıkış mesajı gönderildi: ${member.user.tag}`);
    } catch (error) {
      console.error(`Çıkış mesajı gönderilemedi:`, error);
    }
  },
};
