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
<<<<<<< HEAD

  // AGES DU ROI SA FEMME ET SES ENFANTS
  partie.age += 5;
  if (partie.epoux != null ) {
      partie.epoux[1] += 5;
  }
  var enfants = partie.enfants;

	for ( var i in enfants) {

		partie.enfants[i][2] += 5;
	}


  // ON VERIFIE SI LE ROI DOIT MOURIR
var nouveauroi = 	partie.enfants[0];
if ( partie.age == 80 ) {
  if ( enfants == null) {

    // fin
     gameOver(message, partie);
  }
  else {
      // SI IL DOIT MOURIR ON SELECTIONNE LE PREMIER FIL



    for ( var i in enfants) {
      // On regarde dans la liste des Enfants
      // si l'enfant est le meme que le premier on fait rien
      // si l'enfant est plus agé que l'autre enfant et que c'est un homme c'est le nouveau Roi
      // si l'enfant est le plus agé et que la loi salique est abrogé alors c'est le nouveau roi
      var candidat = 	partie.enfants[i];
      if ( nouveauroi == candidat) {

      }
      else {

        if (candidat[2] > nouveauroi[2] && candidat[3] =="Homme") {

        }
        // si loi salique abrogée
        else if ( candidat[2] > nouveauroi[2] )
        {

        }
      }

    }

    // on modifie les stats de la partie pour le nouveau roi

    partie.nom = nouveauroi[1];
    partie.age = nouveauroi[2];
    partie.sexe = nouveauroi[3];
    partie.epoux = nouveauroi[4];
    partie.enfants = null;
    leroiestMort(message, partie);


  }

}







  // CLEAR
  myBot.clear()
=======
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
>>>>>>> bf06d2ccffc73ebb83121f2143d29d7db95a52ec

  sfm.save(partie.player, partie);

};

<<<<<<< HEAD
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

function leroiestMort(message, partie){

    myBot.clear(message);
    const embed = new Discord.RichEmbed()
    .setTitle('Le Roi est mort , vive le roi ! ')
    .setTimestamp()
    .addField('Le nouveau roi est ', partie.nom)
    .setFooter('Une nouvelle ère démarre aujourd\'hui...');
    message.channel.send({ embed });

}

function gameOver(message, partie){

    myBot.clear(message);
    const embed = new Discord.RichEmbed()
    .setTitle('Le Roi est mort , .... il n\' a plus de prétendants au trone... ')
    .setTimestamp()
    .addField('Game Over ', ':skull:')
    .setFooter('Une nouvelle ère se termine aujourd\'hui...');
    message.channel.send({ embed });

}



=======
>>>>>>> bf06d2ccffc73ebb83121f2143d29d7db95a52ec
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
