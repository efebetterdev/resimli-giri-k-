function loadCommands(client) {
    const ascii = require('ascii-table');
    const fs = require('fs');
    const table = new ascii().setHeading('Commands', 'Status');

    let commandsArray = [];

    const commandsFolder = fs.readdirSync('./Commands');
    for (const folder of commandsFolder) {
        const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter((file) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const commandFile = require(`../Commands/${folder}/${file}`);

            // Hatalı komut dosyalarını kontrol et ve atla
            if (!commandFile.data || !commandFile.data.name) {
                table.addRow(file, "failed (missing data or name)");
                console.error(`Komut dosyası yüklenemedi: ${file}`);
                continue; // Hatalı komut dosyasını atla
            }

            const properties = { folder, ...commandFile };
            client.commands.set(commandFile.data.name, properties);

            commandsArray.push(commandFile.data.toJSON());

            table.addRow(file, "loaded");
        }
    }

    client.application.commands.set(commandsArray);
    console.log(table.toString(), "\nLoaded Commands");
}

module.exports = { loadCommands };
