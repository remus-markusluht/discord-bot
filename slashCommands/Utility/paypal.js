const { SlashCommandBuilder } = require('@discordjs/builders');
const { Discord, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const yaml = require("js-yaml")
const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'))
const commands = yaml.load(fs.readFileSync('./commands.yml', 'utf8'))

module.exports = {
    enabled: commands.Utility.Paypal.Enabled,
    data: new SlashCommandBuilder()
        .setName('paypal')
        .setDescription(commands.Utility.Paypal.Description)
        .addUserOption((option) => option.setName('user').setDescription('User').setRequired(true))
        .addIntegerOption((option) => option.setName('price').setDescription('Price').setRequired(true))
        .addStringOption(option => option.setName('service').setDescription('Service').setRequired(true)),
    async execute(interaction, client) {

        if(config.PayPalSettings.Enabled === false) return interaction.reply({ content: "This command has been disabled in the config!", ephemeral: true })
        if(config.PayPalSettings.OnlyInTicketChannels && !client.tickets.has(interaction.channel.id)) return interaction.reply({ content: config.Locale.NotInTicketChannel, ephemeral: true })

        let doesUserHaveRole = false
        for(let i = 0; i < config.PayPalSettings.AllowedRoles.length; i++) {
            role = interaction.guild.roles.cache.get(config.PayPalSettings.AllowedRoles[i]);
            if(role && interaction.member.roles.cache.has(config.PayPalSettings.AllowedRoles[i])) doesUserHaveRole = true;
          }
        if(doesUserHaveRole === false) return interaction.reply({ content: config.Locale.NoPermsMessage, ephemeral: true })
    
        let user = interaction.options.getUser("user");
        let price = interaction.options.getInteger("price");
        let service = interaction.options.getString("service");
    
        await interaction.deferReply();


        let invoiceObject = {
          "merchant_info": {
            "email": config.PayPalSettings.Email,
            "business_name": interaction.guild.name,
          },
          "items": [{
            "name": service,
            "quantity": 1.0,
            "unit_price": {
              "currency": config.PayPalSettings.Currency,
              "value": price
            },
          }],
          "logo_url": interaction.guild.iconURL(),
          "note": "",
          "payment_term": {
            "term_type": "NET_45"
          },
          "tax_inclusive": false,
        }

        client.paypal.invoice.create(invoiceObject, (err, invoice) => {
          if (err) {
            console.log(err)
          } else {
            client.paypal.invoice.send(invoice.id, function(error, rv) {
              if (err) {
                console.log(err);
              } else {

                const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setStyle('Link')
                        .setURL(`https://www.paypal.com/invoice/payerView/details/${invoice.id}`) 
                        .setLabel(config.Locale.PayPalPayInvoice))


                const embed = new EmbedBuilder()
                .setTitle(config.Locale.PayPalInvoiceTitle)
                .setColor(config.EmbedColors)
                .setDescription(config.Locale.PayPalInvoiceMsg)
                .addFields([
                    { name: `• ${config.Locale.suggestionInformation}`, value: `> **${config.Locale.PayPalSeller}** <@!${interaction.user.id}>\n> **${config.Locale.PayPalUser}** <@!${user.id}>\n> **${config.Locale.PayPalPrice}** ${config.PayPalSettings.CurrencySymbol}${price} (${config.PayPalSettings.Currency})\n> **${config.Locale.suggestionStatus}** 🔴 UNPAID` },
                    { name: `• ${config.Locale.PayPalService}`, value: `> \`\`\`${service}\`\`\`` },
                  ])
                .setTimestamp()
                .setFooter({ text: `${user.tag}`, iconURL: `${user.displayAvatarURL({ dynamic: true, size: 1024 })}` })
                interaction.editReply({ embeds: [embed], components: [row] }).then(async function(msg) {

                  await client.paypalInvoices.ensure(`${invoice.id}`, {
                    userID: user.id,
                    sellerID: interaction.user.id,
                    channelID: interaction.channel.id,
                    messageID: msg.id,
                    invoiceID: invoice.id,
                    price: price,
                    service: service,
                    status: invoice.status,
                  });

                    let logsChannel; 
                    if(!config.paypalInvoice.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.TicketSettings.LogsChannelID);
                    if(config.paypalInvoice.ChannelID) logsChannel = interaction.guild.channels.cache.get(config.paypalInvoice.ChannelID);

                    const log = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(config.Locale.PayPalLogTitle)
                    .addFields([
                        { name: `• ${config.Locale.logsExecutor}`, value: `> <@!${interaction.user.id}>\n> ${interaction.user.tag}` },
                        { name: `• ${config.Locale.PayPalUser}`, value: `> <@!${user.id}>\n> ${user.tag}` },
                        { name: `• ${config.Locale.PayPalPrice}`, value: `> ${config.PayPalSettings.CurrencySymbol}${price}` },
                        { name: `• ${config.Locale.PayPalService}`, value: `> ${service}` },
                      ])
                    .setTimestamp()
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                    .setFooter({ text: `${interaction.user.tag}`, iconURL: `${interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })}` })

                    if (logsChannel && config.paypalInvoice.Enabled) logsChannel.send({ embeds: [log] })
                    })
                  }
                })
              }
            })
          }

}
