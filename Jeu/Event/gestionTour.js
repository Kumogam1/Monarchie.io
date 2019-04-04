const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');
const sfm = require('../Main/saveFileManagement.js');

var tour = 0 ;

exports.gTours = function(message, partie) {
  myBot.clear(message);
  const embed = new Discord.RichEmbed()
  .setTitle('Année ' + partie.annee + ' !')
  .setTimestamp()
  .addField('Meteo', 'Un temps légèrement nuagueux')
  .setFooter('Cliquez sur ➡ pour passer le tour');
  partie.annee += 5;
  sfm.save(partie.player, partie);
  message.channel.send({ embed })
  .then(async function(mes) {
    await mes.react('➡');
  });


  if(tour >1){
    partie.aviAristo -= 0.12 ;
    partie.aviClerge += 0.01 ;
    partie.aviArmee += 0.27 ;

    check(partie) ;
  }

  // CONSEIL
  myBot.writeConseil(message, partie) ;

  tour++ ;
};


function check(partie){
  if(partie.aviClerge>1)
    partie.aviClerge = 1 ;
  if(partie.aviClerge<0)
    partie.aviClerge = 0 ;
}
