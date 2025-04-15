const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('komut listesini getir'),

    async execute(interaction) {
        const emojis = {
            bilgi: '💻',
            genel: '📢',
        };

        await interaction.deferReply({ ephemeral: true });

        const directories = [
            ...new Set(interaction.client.commands.map((cmd) => cmd.folder))
        ];

        const formatString = (str) => `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

        const categories = directories.map((dir) => {
            const getCommands = interaction.client.commands.filter((cmd) => cmd.folder === dir).map((cmd) => {
                return {
                    name: cmd.data.name,
                    description: cmd.data.description || "Bu komut için bir açıklama yok",
                };
            });

            return {
                directory: formatString(dir),
                commands: getCommands,
            };
        });

        const embed = new EmbedBuilder()
            .setDescription("Bir kategori seçiniz");

        const components = (state) => [
            new ActionRowBuilder().addComponents(
                new SelectMenuBuilder()
                    .setCustomId('help-menu')
                    .setPlaceholder('Kategori Seçin')
                    .setDisabled(state)
                    .addOptions(categories.map((cmd) => {
                        const option = {
                            label: cmd.directory,
                            value: cmd.directory.toLowerCase(),
                            description: `${cmd.directory} kategorisi komutları`,
                        };

                        if (emojis[cmd.directory.toLowerCase()]) {
                            option.emoji = emojis[cmd.directory.toLowerCase()];
                        }

                        return option;
                    }))
            )
        ];

        const initialMessage = await interaction.editReply({ embeds: [embed], components: components(false) });

        const filter = (i) => i.user.id === interaction.member.id;

        const collector = initialMessage.createMessageComponentCollector({ filter, componentType: ComponentType.SelectMenu });

        collector.on('collect', (i) => {
            const category = categories.find(
                (x) => x.directory.toLowerCase() === i.values[0]
            );

            const categoryEmbed = new EmbedBuilder()
                .setTitle(`${formatString(category.directory)}`)
                .addFields(
                    category.commands.map((cmd) => {
                        return {
                            name: cmd.name,
                            value: cmd.description,
                            inline: true,
                        };
                    })
                );

            i.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            interaction.editReply({ components: components(true) });
        });
    },
};
    