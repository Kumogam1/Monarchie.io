const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');
const sfm = require('../Main/saveFileManagement.js');

exports.gTours = function(message, partie) {
  sendNouvelleAnnee(message, partie) ;

  partie.aviAristo -= 0.01 ;
  partie.aviClerge -= 0.01 ;
  partie.aviArmee  -= 0.01 ;

  checkOpi(partie) ;

  // CONSEIL
  myBot.writeConseil(message, partie) ;


  // CLEAR
  //myBot.clear()

  sfm.save(partie.player, partie);
};

function sendNouvelleAnnee(message, partie){
    myBot.clear(message);
    const embed = new Discord.RichEmbed()
    .setTitle('Année ' + partie.annee + ' !')
    .setTimestamp()
    .addField('Meteo', 'Un temps légèrement nuagueux')
    .setFooter('Cliquez sur ➡ pour passer le tour');
    partie.annee += 5;
    message.channel.send({ embed })
    .then(async function(mes) {
      await mes.react('➡');
    });

}

function checkOpi(partie){
  if(partie.aviClerge>1)
    partie.aviClerge = 1 ;
  if(partie.aviClerge<0)
    partie.aviClerge = 0 ;

  if(partie.aviArmee>1)
    partie.aviArmee = 1 ;
  if(partie.aviArmee<0)
    partie.aviArmee = 0 ;

  if(partie.aviAristo>1)
    partie.aviAristo = 1 ;
  if(partie.aviAristo<0)
    partie.aviAristo = 0 ;
}
