const { CommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "interactionCreate",

    async execute(interaction, client) {
        const { customId, values, guild, member } = interaction;

       
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return; 
            await command.execute(interaction, client);
        }


        else if (interaction.isStringSelectMenu() && customId === "roller") {
            await handleRoleSelection(interaction, values, guild, member);
        }

     
    },

} 

async function handleRoleSelection(interaction, values, guild, member) {
    for (const roleId of values) {
        const role = guild.roles.cache.get(roleId);
        const hasRole = member.roles.cache.has(roleId);
        
        if (hasRole) {
            await member.roles.remove(roleId);
        } else {
            await member.roles.add(roleId);
        }
    }
    
    await interaction.reply({ content: "Roller güncellendi.", ephemeral: true });
}