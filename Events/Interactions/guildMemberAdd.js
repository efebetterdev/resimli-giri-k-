const { WelcomeLeave } = require('canvafy');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const girişKanalId = db.get(`girişKanal_${member.guild.id}`);
      if (!girişKanalId) {
        console.log(`Giriş kanalı ayarlanmamış: ${member.guild.id}`);
        return;
      }

      const girişKanal = member.guild.channels.cache.get(girişKanalId);
      if (!girişKanal) {
        console.log(`Belirtilen giriş kanalı bulunamadı: ${girişKanalId}`);
        return;
      }

      const arkaPlanUrl = db.get(`arkaPlan_${member.guild.id}`) || 'https://r.resimlink.com/QxSaz15M.jpeg';

      const welcome = await new WelcomeLeave()
        .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
        .setBackground('image', arkaPlanUrl)
        .setTitle(`${member.user.username}`)
        .setDescription('Aramıza katıldığın için çok mutluyuz!')
        .setBorder('#1e90ff')
        .setAvatarBorder('#4682b4')
        .setOverlayOpacity(0.3)
        .build();

      const attachment = new AttachmentBuilder(welcome, { name: 'welcome.png' });
      const toplamÜyeSayısı = member.guild.memberCount;

      const hoşgeldinMesajları = [
        'Aramıza hoş geldin, dostum!',
        'Harika bir gün seni burada görmekle başladı!',
        'Sana özel bir yerimiz var, hemen keşfetmeye başla!',
      ];
      const rastgeleMesaj = hoşgeldinMesajları[Math.floor(Math.random() * hoşgeldinMesajları.length)];

      const embed = new EmbedBuilder()
        .setColor('#4682b4')
        .setTitle('Yeni bir üye katıldı!')
        .setDescription(
          `${rastgeleMesaj}
          Merhaba <@${member.user.id}> (kullanıcı adı: **${member.user.username}**), sunucumuza hoş geldin! 
          Toplam üye sayımız şu anda: **${toplamÜyeSayısı}**. Bizimle olduğun için teşekkür ederiz!`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage('attachment://welcome.png')
        .setTimestamp()
        .setFooter({
          text: 'Daha güzel günler burada seni bekliyor!',
          iconURL: member.guild.iconURL({ dynamic: true }),
        });

      await girişKanal.send({
        content: `Hoş geldin <@${member.user.id}>!`,
        embeds: [embed],
        files: [attachment],
      });

      try {
        await member.send(
          `Merhaba **${member.user.username}**! Sunucumuza hoş geldin. Daha fazla bilgi ve kurallar için lütfen göz at: ${girişKanal}`
        );
      } catch (dmError) {
        console.log(`Doğrudan mesaj gönderilemedi: ${dmError.message}`);
      }

      const otoRolId = db.get(`otoRol_${member.guild.id}`);
      if (otoRolId) {
        const rol = member.guild.roles.cache.get(otoRolId);
        if (rol) {
          await member.roles.add(rol);
          console.log(`Otomatik rol atandı: ${rol.name}`);
        } else {
          console.log(`Otomatik rol bulunamadı: ${otoRolId}`);
        }
      }

      console.log(`Hoş geldiniz mesajı başarıyla gönderildi: ${member.user.username}`);
    } catch (error) {
      console.error('Hoş geldiniz mesajı gönderilirken bir hata oluştu:', error);
    }
  },
};
