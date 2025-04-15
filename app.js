const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ButtonBuilder, VoiceConnectionStatus, joinVoiceChannel, Events, ActionRowBuilder, ButtonStyle } = require('discord.js');

const { Guilds, GuildMembers, GuildMessages, MessageContent, GuildMessageReactions, GuildModeration } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel, DirectMessages } = Partials;

const { loadEvents } = require('./Handlers/eventHandler');
const { loadCommands } = require('./Handlers/commandHandler');

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, 'GuildVoiceStates', MessageContent, GuildMessageReactions, GuildModeration],
    partials: [User, Message, GuildMember, ThreadMember, Channel, DirectMessages],
    allowedMentions: {
        repliedUser: false,
    },
});

client.on("ready", () => {
    console.log("Now Online: " + client.user.tag);
});

client.commands = new Collection();
client.config = require('./config.json');

client.login(client.config.token).then(() => {
    loadEvents(client);
    loadCommands(client);
});

