// Copyright 2025 Khayla
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { 
    Client, 
    IntentsBitField, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// token loader
const load = name => fs.readFileSync(`./secret/token`, "utf8").trim();

// load or create config.json
const configPath = path.join(__dirname, "config.json");

if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
        configPath,
        JSON.stringify({ verifyMessageId: null }, null, 4)
    );
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});





client.on('clientReady', async (c) => {
    console.log(`${c.user.tag} is online and running`);

    try {
        const channel = await client.channels.fetch('1462769864551956530');
        if (!channel) return;

        let message;

        if (config.verifyMessageId) {
            try {
                message = await channel.messages.fetch(config.verifyMessageId);
                console.log("Reusing existing verification message");
            } catch {
                console.log("Saved message not found, creating a new one");
            }
        }

        if (!message) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('1462944598157688973')
                    .setLabel('I have read the rules')
                    .setStyle(ButtonStyle.Primary)
            );

            message = await channel.send({
                content: 'By clicking the button below you agree you have read the rules and guidelines',
                components: [row],
            });

            config.verifyMessageId = message.id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        }

    } catch (error) {
        console.log(error);
    }
});

const roles = [
    {
        id: '1462944598157688973',
        label: 'I have read the rules'
    }
];

client.on('interactionCreate', async (interaction) => {
    try {
        if (!interaction.isButton()) return;

        await interaction.deferReply({ flags: 64 });

        const role = interaction.guild.roles.cache.get(interaction.customId);
        if (!role) {
            interaction.editReply({
                content: "I could not find that role, please ping @KhaylaPaws",
            });
            return;
        }

        const hasRole = interaction.member.roles.cache.has(role.id);

        if (hasRole) {
            await interaction.editReply('You already have that role silly');
            return;
        }

        await interaction.member.roles.add(role);
        await interaction.editReply('Success! Welcome to my server!');

    } catch (error) {
        console.log(error);
    }
});

client.login(load("token"));