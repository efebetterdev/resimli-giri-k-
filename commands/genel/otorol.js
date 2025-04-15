const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const db = require('croxydb'); // Veritabanı için croxydb kullanımı

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setautorole')
    .setDescription('Sunucu için otomatik rol ayarlayın.')
    .addRoleOption(option => 
      option
        .setName('rol')
        .setDescription('Otomatik atanacak rolü seçin.')
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      // Yalnızca yetkili kullanıcılar komutu çalıştırabilir
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return interaction.reply({
          content: 'Bu komutu kullanmak için `Rolleri Yönet` yetkisine sahip olmalısınız.',
          ephemeral: true,
        });
      }

      // Kullanıcının seçtiği rolü al
      const rol = interaction.options.getRole('rol');

      // Veritabanına kaydet
      db.set(`otoRol_${interaction.guild.id}`, rol.id);

      return interaction.reply({
        content: `Otomatik atanacak rol başarıyla ayarlandı: **${rol.name}**`,
        ephemeral: true,
      });
    } catch (error) {
      console.error('Otomatik rol ayarlanırken bir hata oluştu:', error);
      return interaction.reply({
        content: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        ephemeral: true,
      });
    }
  },
};
