const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');
const sfm = require('../Main/saveFileManagement.js');

exports.gTours = function(message, partie) {
  myBot.clear(message);

  partie.aviAristo -= 0.01 ;
  partie.aviClerge -= 0.01 ;
  partie.aviArmee  -= 0.01 ;

  checkOpi(partie) ;

  // Ecriture des channels
  if (partie.annee > 1300) {
    his.historique(message, partie);
  }
  myBot.writeConseil(message, partie) ;
  initJeu.actions(message, partie);
  myBot.writeFamille(message, partie);


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






  naissance(partie);

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

function naissance(partie){
  var res = null;
  var rand = null;
  var nais = Math.floor(Math.random() * 10) + 1;
  if (nais <= 5){
    var sexe = Math.floor(Math.random() * 10) + 1;
    if (sexe >= 5){
      var myArray = ['Henry', 'Frederic', 'Philippe','Louis', 'Eric', 'Edouard','Charles'];
     rand = myArray[Math.floor(Math.random() * myArray.length)];
      res = 'Homme';
    }
    else {
      var myArray = ['Margot', 'Antoinette', 'Lucile','Robertine', 'Amalia', 'Anais','Nolane'];
      rand = myArray[Math.floor(Math.random() * myArray.length)];
      res = 'Femme'
    }
    var nouveau = [4,rand,0,res,null];

    partie.enfants.push(nouveau);
  }
  let embed = new Discord.RichEmbed()
  .setColor(15013890)
  .setTitle('Journal de bord - Année' + partie.annee)
  .addField('Naissance !', rand + ' est né(e).')



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
