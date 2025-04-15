const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test this bot'),
    async execute(interaction) {
        await interaction.reply(`Bot working.\n\nBot Ping : ${interaction.client.ws.ping}ms`);
    }
}; 