const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');
const sfm = require('../Main/saveFileManagement.js');

var tour = 0 ;

exports.gTours = function(message, partie) {
  sendNouvelleAnnee(message, partie) ;

  partie.aviAristo -= 0.14 ;
  partie.aviClerge += 0.01 ;
  partie.aviArmee += 0.08 ;

  checkOpi(partie) ;

  // CONSEIL
  myBot.writeConseil(message, partie) ;

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
  }
  else {
      // SI IL DOIT MOURIR ON SELECTIONNE LE PREMIER FILS

    if ( nouveauroi[3] =="Femme") {

      // fin
    }

    else {

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
        else if ( candidat[2] > nouveauroi[2]    )
      }

    }
  }
}

// on modifie les stats de la partie pour le nouveau roi


}







  // CLEAR
  myBot.clear()

  sfm.save(partie.player, partie);

  tour++ ;
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
