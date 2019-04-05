const Discord = require('discord.js');
const fs = require('fs');
const myBot = require('./myBot.js');

const opi = require('../Personnages/opinion.json');


const initJeu = require('./initJeu.js');
const finJeu = require('./finJeu.js');
const sfm = require('./saveFileManagement.js');
const his = require('../Historique/historique.js')
const gt = require('../Event/gestionTour.js')

const client = new Discord.Client();
const config = require('../token.json');

// Dossier des personnages
const perso = require('../Personnages/perso.json');
// Dossier des actions
const tableaux = require('../Actions/tableaux.json');

// Fonction qui s'active quand le bot est lancé
client.on('ready', () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity('gouverner la France');
});

// Fonction qui s'active quand le bot est crash
client.on('error', error => {
  const errorTime = new Date().toUTCString();
  const errorLog = errorTime + ' : The server lost connexion\n \n';
  console.log(errorLog);
  throw error;
});

// Fonction qui s'active lorsqu'un message est écrit
client.on('message', (message) => {

  // Si le message provient d'un bot ou qu'il ne contient pas le prefix approprié, on ne fait rien
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  else {
    // args est un tableau comprenant tous les arguments écrit après la commande
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

    // command est la commande écrite par le joueur
    const command = args.shift().toLowerCase();

    let partie;
    // on charge les informations du joueur

    try{
      partie = sfm.loadSave(message.author.id);
    }
    catch(e) {
      initJeu.initStat(message.author);
      partie = sfm.loadSave(message.author.id);
    }


    switch(command) {
      case 'perso':
        for (var i=0; i < 5; i++){
          writePerso(message, i);
        }
        break;
      case 'fct':
        writeConseil(message, partie);
        break;
      // Start : commencer une partie
      case 'start':
        //sfm.save(message.author.id, partie);
        initJeu.initJeu(message, client);
        break;
      case 'test':
        his.historique(message, partie);
        break;
      // Help : afficher toutes les commandes importantes
      case 'help':
        const embed = new Discord.RichEmbed()
        .setColor(15013890)
        .setTitle('**Help**')
        .addField(config.prefix + 'start', 'Commencer une partie')
        .addField(config.prefix + 'tuto', 'Commencer un tutoriel')
        .addField(config.prefix + 'end', 'Terminer une partie *(Seulement en partie)*')
        message.channel.send({ embed });
        break;
      // Tuto : commencer un tutoriel
      case 'tuto':
        sfm.save(message.author.id, partie);
        initJeu.initJeu(message, client);
        break;
      // End : terminer la partie
      case 'end':
        finJeu.msgFin(message, partie);
        break;
      // Quit : quitter la partie
      case 'quit':
        finJeu.finJeu(message);
        break;
      // Text : afficher le texte de présentation du projet
      case 'text':
        text(message);
        break;
      case 'clear':
        myBot.clear(message);
        break;
      // Autre : commande inconnue
      default:
        message.channel.send('Commande inconnue');
        break;
		}
  }
});

// Fonction qui s'active lorsque le joueur réagit à un message
client.on('messageReactionAdd', (reaction, user) => {

  // Si le message provient d'un bot, on ne fait rien
  if(user.bot) return;

  // On charge les informations du joueur
  const partie = sfm.loadSave(user.id);
  let tabNR = []; // tableau des noms des repas
  let tabNA = []; // tableau des noms d'activités
  let tabER = []; // tableau des emotes des repas
  let tabEA = []; // tableau des emotes d'activités
  let tabIA = []; // tableau de l'impact des activités
  let tabIR = []; // tableau de l'impact  des repas

  // On attribut à chaque tableau les informations appropriées en fonction de la partie du jour
  tabNR = tableaux.nomRepasM;
  tabNA = tableaux.nomActiviteM;
  tabIA = tableaux.impactAM;
  tabIR = tableaux.impactRM;


  // Action effectuée en fonction de la réaction
  switch(reaction.emoji.name) {
    // Choix d'un personnage prédéfini
    case '✅':
      initJeu.accueil(reaction.message, partie);
      break;
    // Passer à l'évenement suivant
    case '➡':
      gt.gTours(reaction.message, partie);
      break;
    case '👴':
      myBot.clear(reaction.message);
      numPerso = 0;
      initJeu.initPerso(reaction.message, numPerso, partie);
      break;
    case '👱':
      myBot.clear(reaction.message);
      numPerso = 2;
      initJeu.initPerso(reaction.message, numPerso, partie);
      break;
    case '👲':
      myBot.clear(reaction.message);
      numPerso = 3;
      initJeu.initPerso(reaction.message, numPerso, partie);
      break;
    case '👵':
      myBot.clear(reaction.message);
      numPerso = 4;
      initJeu.initPerso(reaction.message, numPerso, partie);
      break;
    case '👸':
      myBot.clear(reaction.message);
      numPerso = 5;
      initJeu.initPerso(reaction.message, numPerso, partie);
      break;
    case '👶':

      marierEnfant(reaction.message, numPerso, partie)
      sfm.save(partie.player, partie);
      break;
    case '🎊':
      if (partie.feteOrganise){
        fete(reaction.message, partie);
        partie.feteOrganise = false;
        sfm.save(partie.player, partie);
      };
      break;
    case '🏹':
      if (partie.guerreDeclare){
        guerre(reaction.message, partie);
        partie.guerreDeclare = false;
        sfm.save(partie.player, partie);
      };
      break;
    case'🗡':
    /*  if (partie.epoux != null) {
        tuerfemme(reaction.message,partie);
          sfm.save(partie.player, partie);
      }
      */
  }
});

// Fonction qui s'active lorsqu'un joueur entre dans le serveur
client.on('guildMemberAdd', (member) => {
    initJeu.initstat(member.user);
});

/** Fonction qui renvoie l'id du channel qui a pour nom chanName
* @param {string} message - Message discord
* @param {string} chanName - Nom du channel dans lequel le message sera envoyé
* @param {Object} partie - Objet json de la partie
* @return {number} Identifiant du channel
**/
exports.messageChannel = function messageChannel(message, chanName, partie) {

  // Liste des channels de la partie du joueur
  const listChan2 = finJeu.listChan(message, partie);

  let id = 1;
  listChan2.forEach(channel => {
      if(channel.name === chanName)
      {
          id = channel.id;
      }
  });
  return id;
};

exports.writePerso = function writePerso(message, numPerso) {
        var enf ="";
        var size = perso.enfants[numPerso].length;
        if (size == 0) {
          enf = "Aucun enfant";
        } else {
          for (var size in perso.enfants[numPerso]){
              enf = enf + "  \n | " +perso.id[perso.enfants[numPerso][size] - 1]  + " "  + perso.nom[perso.enfants[numPerso][size] - 1];
          }
        }

        message.channel.send({ embed: {
          color: 0x00AE86,
          author:
          {
            name: 'Présentation',
          },
          fields: [{
              name: 'Nom',
              value: perso.nom[numPerso],
          },
          {
              name: 'Sexe',
              value: perso.sexe[numPerso],
          },
          {
              name: 'Age',
              value: perso.age[numPerso],
          },
          {
            name: 'Enfants',
            value: enf,
          },
          {
            name: 'Icone',
            value : perso.icone[numPerso],
          }
        ],
        } });

}

// Conseil
exports.writeConseil = function writeConseil(message, partie){

  var id = myBot.messageChannel(message, "conseil", partie);

  message.delete();

  myBot.clear(message)

  var laws = "" ;

  for(var i = 0 ; i<opi.loies.length ; i++){
    laws += "**" + opi.loies[i] + "** : " + opi.loiesDesc[i] + "\n" ;
  }

  message.guild.channels.get(id).send({embed: {
      color : 0X4141FF,
      author:
      {
        name: 'Loies',
      },
      fields: [
        {
          name : 'Loies Votables (' + opi.loies.length + ")",
          value : laws,
        },
        {
          name : 'Loies Adopées',
          value : 'Liste des loies votables',
        },
      ],
    }
  }) ;

  var opiArmee = "" ;
  var opiClerg = "" ;
  var opiAristo = "" ;


  for(var i = 0 ; i<opi.loies.length ; i++){
    if(opi.aviArmee[i]<0.33)
      opiArmee  += "" + opi.loies[i] + " :\n:small_orange_diamond:  nous sommes favorable à " + Math.trunc(opi.aviArmee[i] *100) + "%\n" ;
    else if(opi.aviArmee[i]<0.66)
      opiArmee  += "" + opi.loies[i] + " :\n:white_small_square:  nous sommes favorable à "   + Math.trunc(opi.aviArmee[i] *100) + "%\n" ;
    else
      opiArmee  += "" + opi.loies[i] + " :\n:small_blue_diamond:  nous sommes favorable à "   + Math.trunc(opi.aviArmee[i] *100) + "%\n" ;

    if(opi.aviClerge[i]<0.33)
      opiClerg  += "" + opi.loies[i] + " :\n:small_orange_diamond:  nous sommes favorable à " + Math.trunc(opi.aviClerge[i] *100) + "%\n" ;
    else if(opi.aviClerge[i]<0.66)
      opiClerg  += "" + opi.loies[i] + " :\n:white_small_square:  nous sommes favorable à "   + Math.trunc(opi.aviClerge[i] *100) + "%\n" ;
    else
      opiClerg  += "" + opi.loies[i] + " :\n:small_blue_diamond:  nous sommes favorable à "   + Math.trunc(opi.aviClerge[i] *100) + "%\n" ;

    if(opi.aviAristo[i]<0.33)
      opiAristo  += "" + opi.loies[i] + " :\n:small_orange_diamond:  nous sommes favorable à " + Math.trunc(opi.aviAristo[i] *100) + "%\n" ;
    else if(opi.aviAristo[i]<0.66)
      opiAristo  += "" + opi.loies[i] + " :\n:white_small_square:  nous sommes favorable à "   + Math.trunc(opi.aviAristo[i] *100) + "%\n" ;
    else
      opiAristo  += "" + opi.loies[i] + " :\n:small_blue_diamond:  nous sommes favorable à "   + Math.trunc(opi.aviAristo[i] *100) + "%\n" ;
  }

  message.guild.channels.get(id).send({embed: {
      color : 0X4141FF,
      author:
      {
        name: 'Membres du conseil',
      },
      fields: [
        {
          name : "Armées (" + partie.aviArmee*100 + '%)',
          value : opiArmee,
        },
        {
          name : "Clergé (" + partie.aviClerge*100 + '%)',
          value : opiClerg,
        },
        {
          name : "Arosticrates (" + partie.aviAristo*100 +'%)',
          value : opiAristo,
        },
      ],
    }
  }) ;
  /*  EXEMPLE DE VOTE
  console.log(opi.loies[0] + " : " +vote(opi.loies[0]));
  console.log(opi.loies[1] + " : " +vote(opi.loies[1]));
  console.log(opi.loies[2] + " : " +vote(opi.loies[2]));
  //*/
}

exports.vote = function vote(law, partie){
  var aviFinal = 0 ;

  for(var i in opi.loies.length){
    if(opi.loies[i] == "law")
      aviFinal = (opi.aviArmee[i] * partie.aviArmee + opi.aviClerge[i] * partie.aviClerge + opi.aviAristo[i] * partie.aviAristo) / (partie.aviAristo + partie.aviClerge + partie.aviArmee) ;
  }

  return aviFinal >= 0.5 ;
}


// Statistiques
function writeStat(message, partie){

  //Récupérer les enfants
  var enf =""

  for (var i in perso.enfants[numPerso]){
    enf = enf + "  \n | " +perso.id[perso.enfants[numPerso][i] - 1]  + " "  + perso.nom[perso.enfants[numPerso][i] - 1];
    // perso.nom[perso.enfants[i]] = Le nom de l'enfant dont l'ID est mentionné au rang i
  }

  var id = myBot.messageChannel(message, "statistiques", partie);

  message.guild.channels.get(id).send({embed: {
      color : 0Xa1f442,
      author:
      {
        name: 'Statistiques',
      },
      fields: [
      {
        name : "Année actuelle",
        value : "1300 (en dur, à mettre dans une variable globale)",
      },
      {
        name : 'Nom',
        value : perso.nom[0],
      },
      {
        name : 'Age',
        value : perso.age[0],
      },
      {
        name : 'Epoux/se',
        value : perso.epoux[0],
      },
      {
        name : "Enfant(s)",
        value : enf,
      },
    ],
  } });
}


// Statistiques
function writeStat(message, partie){

  const id = myBot.messageChannel(message, "famille", partie);
  //Récupérer les enfants
  var enf =""

  for (var i in perso.enfants[numPerso]){
    enf = enf + "  \n | " +perso.id[perso.enfants[numPerso][i] - 1]  + " "  + perso.nom[perso.enfants[numPerso][i] - 1];
    // perso.nom[perso.enfants[i]] = Le nom de l'enfant dont l'ID est mentionné au rang i
  }

var id = myBot.messageChannel(message, "statistiques", partie);

message.guild.channels.get(id).send({embed: {
    color : 0Xa1f442,
    author:
    {
      name: 'Statistiques',
    },
    fields: [
    {
      name : "Année actuelle",
      value : "1300 (en dur, à mettre dans une variable globale)",
    },
    {
      name : 'Nom',
      value : perso.nom[0],
    },
    {
      name : 'Age',
      value : perso.age[0],
    },
    {
      name : 'Epoux/se',
      value : perso.epoux[0],
    },
    {
      name : "Enfant(s)",
      value : enf,
    },
  ],
} });
  const embed = new Discord.RichEmbed()
	.setTitle('Gérez votre famille')
	.setColor(808367)// Symbole médecine
	.setTimestamp() // Crée de l'espace
  .addField( )
	.addField(':older_man:  ', ' afficher ici le nom et prénom ! \n afficher ici   l\'age ! ')
  .addField(' :baby: ', enf)
  .addField(':ring:  ', 'afficher ici le nom du conjoint ')
  .setTimestamp()
  .addField('Tuer : ', ':dagger:')
  .addField('Marier : ', ':ring:')
  .addField('Marier un enfant : ', ':ring: :baby:')

  message.guild.channels.get(id).send({embed})
  .then(async function(mess) {
		await mess.react('🗡');
    await mess.react('💍');
    await mess.react('👶');
	});
}

exports.writeFamille = function(message, partie) {
  const id = myBot.messageChannel(message, "famille", partie);
  //Récupérer les enfants
  var enf =" "

  for (var i in partie.enfants){
    enf = enf + " | " +partie.enfants[i][1]  + " "  ;
    // perso.nom[perso.enfants[i]] = Le nom de l'enfant dont l'ID est mentionné au rang i
  }

  var conjoint = partie.epoux;
  var nom = partie.nom;
  const embed = new Discord.RichEmbed()
	.setTitle('Gérez votre famille')
	.setColor(808367)// Symbole médecine
	.setTimestamp() // Crée de l'espace
  .addField( )
	.addField(':older_man:  ', nom)
  .addField(' :baby: ', enf)
  .addField(':ring:  ', conjoint)
  .setTimestamp()
  .addField('Tuer : ', ':dagger:')
  .addField('Marier : ', ':ring:')
  .addField('Marier un enfant : ', ':ring: :baby:')

  message.guild.channels.get(id).send({embed})
  .then(async function(mess) {
		await mess.react('🗡');
    await mess.react('💍');
    await mess.react('👶');
	});
}

function marierEnfant(message,numPerso,partie) {
  const id = myBot.messageChannel(message, "famille", partie);
  var enf =""
  var pret = ""
  var nb = 0;

  for (var i in partie.enfants){
    var num =i + 1;
    enf = enf + " | " +num + " ->  " +partie.enfants[i][1]  + " \n "  ;
    // perso.nom[perso.enfsants[i]] = Le nom de l'enfant dont l'ID est mentionné au rang i
  }
  var myArray = ['Marie-Eve', 'Juliette', 'Théophanie'];
  for (var i in myArray){
    var num =i + 1;
    pret = pret + " | " + num + " ->  " +myArray[i]  + " \n "  ;
    // perso.nom[perso.enfants[i]] = Le nom de l'enfant dont l'ID est mentionné au rang i
  }

  console.log(pret);
  const embed = new Discord.RichEmbed()
  .setTitle('Marier un enfant')
  .setColor(808367)// Symbole médecine
  .setTimestamp() // Crée de l'espace
  .addField(' Liste des enfants  : ', enf)
  .addField(' Liste des prétendant/es ', pret)
  .addField(' Séléctionnez l\'enfant à marier et sa prétendante en écrivant le numéro de l\'enfant puis du prétendant', ' -')
  .addField('exemple : commande 1 1', ' - ')
  message.guild.channels.get(id).send({embed})
  client.on('message', (message) => {

    // Si le message provient d'un bot ou qu'il ne contient pas le prefix approprié, on ne fait rien
  	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    else {
      const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

      var enfant;
      var pretendante;
      // command est la commande écrite par le joueur
       enfant = args[0].toLowerCase() - 1;
       idenfant = partie.enfants[enfant];
       pretendante = myArray[args[1].toLowerCase() - 1];

       // on change l'épouse
      idenfant[4] = pretendante;

       perso.epoux[8 - 1 ] = idenfant[0];
       partie.aviClerge += 0.2 ;
       partie.aviAristo += 0.2 ;
       var phrase = "  " + partie.enfants[enfant][1] + " et " + partie.enfants[enfant][4] + " sont maintenant mari et femme ! ";
       const embed = new Discord.RichEmbed()
       .setTitle('Marier un enfant')
       .setColor(808367)// Symbole médecine
       .setTimestamp() // Crée de l'espace
       .addField(' Félicitations !   : ', phrase)
       message.guild.channels.get(id).send({embed})


    }
  });

}

function tuerfemme(message,partie) {

  const id = myBot.messageChannel(message, "famille", partie);
  const embed = new Discord.RichEmbed()
  .setTitle('Gérez votre famille')
  .setColor(808367)// Symbole médecine
  .setTimestamp() // Crée de l'espace
  .addField( )
  .addField(':scream:  ', ' Souhaitez vous vraiment vous débarasser de votre femme ?')
  .addField(' ->   ', ' Répondez oui ou non dans le chat  !')
  message.guild.channels.get(id).send({embed})
  .then(async function(mess) {
    await mess.react('😏');
  });
  client.on('message', (message) => {

    // Si le message provient d'un bot ou qu'il ne contient pas le prefix approprié, on ne fait rien
  	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    else {
      const args = message.content.slice(config.prefix.length).trim().split(/ +/g);

      var enfant;
      var pretendante;
      // command est la commande écrite par le joueur
       reponse = args.shift().toLowerCase();

       if ( reponse =="non") {
         var phrase = " " + partie.epoux + " est toujours en vie  " ;
         const embed = new Discord.RichEmbed()
         .setTitle('Votre femme va bien')
         .setColor(808367)// Symbole médecine
         .setTimestamp() // Crée de l'espace
         .addField('ouf  ! ', phrase)
          message.guild.channels.get(id).send({embed})
       }
      else {

       partie.aviClerge += 0.2 ;
       partie.aviAristo += 0.2 ;
       var phrase = " " + partie.epoux + " a fait une chute fatale dans un puit ! " ;
       const embed = new Discord.RichEmbed()
       .setTitle('Votre femme vient de mystérieusement disparaitre')
       .setColor(808367)// Symbole médecine
       .setTimestamp() // Crée de l'espace
       .addField('oops ! ', phrase)
       message.guild.channels.get(id).send({embed})
       partie.epoux = null;
       console.log(partie.epoux);
       sfm.save(partie.player, partie);

    }
  }
  });

}


/** Fonction qui écrit le texte explicatif sur le serveur Discord
* @param {string} message - Message discord
**/
function text(message) {

  // Supprime le message
  message.delete();

  const embed = new Discord.RichEmbed()
  .setColor(0x00AE86)
  .setTitle('Bienvenue dans Medieval.io.')

  .addField('Qu\'est ce que Medieval.io ?', 'La monarchie est soumise à des lois qui ne sont pas toujours contournables, même pas le monarque lui-même. Les droits de successions peuvent s\'avérer compliqués; il est alors primordial d\'assurer sa descendance afin de voir sa famille rester au pouvoir.')
  .addField('Vous êtes Roi de France en l\'an de grâce 1300', 'Vous avez donc sous votre gouvernance un royaume et votre famille. Pour garantir la prospérité de la nation et de votre nom, vous allez devoir faire preuve de reflexion afin de garantir votre règne et celui de votre lignée. Pour cela vous allez devoir gérer vos relation et la legislation du pays.')
  .addField('Comment jouer ?', 'Chaque tour dure 5 ans, vous pouvez alors choisir ce que vous voulez faire pour cette période. Tous les choix se feront à l\'aide des réactions que vous mettrez sous les messages ou par message texte.')
  .addField('Changer la législation', 'Vous pouvez changer les lois en votre faveure en faisant voter par le conseil pour que votre descendance reste au pouvoir après votre mort ou en abrogeant celles qui menacent votre lignée.')
  .addField('Gérer votre famille', 'Vous pouvez gérer votre famille, à commencer par vous-même. Vous pouvez vous marier, marier vos enfants avec d’autres nobles ou encore les confier à l’église ou aux forces armées de votre pays.')
  .addField('Votre objectif ?', 'Faire régner votre déscendance le plus longtemps possible, si vous gérez votre règne correctement vous allez alors avancer dans le temps et voir les générations de votre famille se succéder au trone.');

  message.channel.send({ embed });
}

/** Fonction qui permet d'effacer le message quand on passe au suivant
* @param {string} message - Message discord
**/
exports.clear = async function(message) {
    // message.delete();
    const fetched = await message.channel.fetchMessages();
    message.channel.bulkDelete(fetched);
};

exports.war = function war(){
  var res = 0;
  var adv = Math.floor(Math.random() * 10) + 1 ;
  var us = Math.floor(Math.random() * 10) + 1;
  if (us >= adv){
    res = 1;
  }
  return res;
};

exports.party = function party(){
  var res = 0;
  var lame = Math.floor(Math.random() * 3);
  if (lame != 0){
    res = 1;
  }
  return res;
};

function guerre(message, partie){
  var res = 'Vous avez perdue la guerre, l\'opinion générale à votre égart a baissé';
  if (myBot.war() == 1){
    res = 'Vous avez gagné la guerre, vous gagnez en popularité'
    partie.avisArmee += 0.2;
    partie.avisClerg += 0.2;
    partie.avisAristo += 0.2;
  }
  else{
    partie.avisArmee -= 0.2;
    partie.avisClerg -= 0.2;
    partie.avisAristo -= 0.2;
  }

  const embed = new Discord.RichEmbed()
  .setColor(0x00AE86)
  .setTitle('Guerre 🏹')
  .addField('Vous avez déclaré une guerre contre un pays voisin.', res);

  var id = myBot.messageChannel(message, "actions", partie);
  message.guild.channels.get(id).send({ embed })
};

function fete(message, partie){
  var res = 'La soirée fut un desastre, votre relation avec la noblesse s\'est envenimée';
  if (myBot.party() == 1){
    res = 'La soirée fut un succès, votre relation avec la noblesse s\'est améliorée';
    partie.opiAristo += 0.1;
  }
  else{
    partie.opiAristo -= 0.1;
  }

  const embed = new Discord.RichEmbed()
  .setColor(0x00AE86)
  .setTitle('Fête 🎊')
  .addField('Vous avez organisé une fête.', res);

  var id = myBot.messageChannel(message, "actions", partie);
  message.guild.channels.get(id).send({ embed })
};



client.login(config.token);
