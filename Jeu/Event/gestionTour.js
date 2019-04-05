const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');
const sfm = require('../Main/saveFileManagement.js');
const initJeu = require('../Main/initJeu.js');
const his = require('../Historique/historique.js');

exports.gTours = function(message, partie) {
  myBot.clear(message);

  partie.aviAristo -= 0.14 ;
  partie.aviClerge += 0.01 ;
  partie.aviArmee += 0.08 ;

  checkOpi(partie) ;

  // Ecriture des channels
  myBot.writeConseil(message, partie) ;
  initJeu.actions(message, partie);
  myBot.writeFamille(message, partie);

  if (partie.annee > 1300) {
    his.historique(message, partie);
  }

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

  sfm.save(partie.player, partie);

};

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
