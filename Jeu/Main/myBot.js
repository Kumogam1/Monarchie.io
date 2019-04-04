const Discord = require('discord.js');
const fs = require('fs');
const myBot = require('./myBot.js');

const opi = require('../Personnages/opignon.json');


const initJeu = require('./initJeu.js');
const finJeu = require('./finJeu.js');
const sfm = require('./saveFileManagement.js');
//const his = require('../Historique/historique.js')

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
      const chanId1 = myBot.messageChannel(reaction.message, 'Statistiques', partie);
      const chanId2 = myBot.messageChannel(reaction.message, 'Historique', partie);
      const chanId3 = myBot.messageChannel(reaction.message, 'Conseil', partie);
      const chanId4 = myBot.messageChannel(reaction.message, 'Famille', partie);
      const chanId5 = myBot.messageChannel(reaction.message, 'Finances', partie);
      if(partie.tuto)
        fieldTextInfo = 'Voici le channel Statistiques .\n Toutes les informations sur votre famille apparaitront ici';
      else
        fieldTextInfo = 'Un petit récapitulatif du taux de glycémie.';

      reaction.message.guild.channels.get(chanId2).send({embed: {
        color: 15013890,
        fields: [{
          name: 'Channel Informations',
          value: fieldTextInfo
        }]
        } });
      break;
      case '👴':
        numPerso = 0;
      break;
      case '👱':
        numPerso = 2;
      break;
      case '👲':
        numPerso = 3;
      break;
      case '👵':
        numPerso = 4;
      break;
      case '👸':
        numPerso = 5;
      break;
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
          console.log(id) ;
      }
  });
  return id;
};

exports.writePerso = function writePerso(message, numPerso) {

        var enf =""
        for (var i in perso.enfants[numPerso]){
          enf = enf + " " + perso.enfants[numPerso][i];
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
function writeConseil(message, partie){

  var id = myBot.messageChannel(message, "conseil", partie);

  message.guild.channels.get(id).send({embed: {
      color : 0X4141FF,
      author:
      {
        name: 'Conseil',
      },
      fields: [
        {
          name : "Membres du conseil",
          value : "les membres du conseils",
        },
        {
          name : 'Loies Votables',
          value : 'Liste des loies',
        },
        {
          name : 'Loies Adopées',
          value : 'Liste des loies votables',
        },
      ],
    }
  }) ;
}


// Statistiques
function writeStat(message, partie){

  //Récupérer les enfants
  var enf =""

  for (var i in perso.enfants){
    enf = enf + " " + perso.enfants[i];
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

client.login(config.token);
