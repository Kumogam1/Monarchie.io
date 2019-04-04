const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');
const sfm = require('../Main/saveFileManagement.js');

exports.gTours = function(message, partie) {
  myBot.clear(message);
  const embed = new Discord.RichEmbed()
  .setTitle('Année ' + partie.annee + ' !')
  .setTimestamp()
  .addField('Meteo', 'Un temps légèrement nuagueux')
  .setFooter('Cliquez sur ➡ pour passer le tour');
  partie.annee += 5;
  sfm.save(message.author.id, partie);
  message.channel.send({ embed })
  .then(async function(mes) {
    await mes.react('➡');
  });
};
