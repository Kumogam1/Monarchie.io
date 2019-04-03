const Discord = require('discord.js');
const fs = require('fs');
const myBot = require('./myBot.js');


const initJeu = require('./initJeu.js');
const finJeu = require('./finJeu.js');
const sfm = require('./saveFileManagement.js');

const client = new Discord.Client();

const config = require('../token.json');

// Fonction qui s'active quand le bot est lancé
client.on('ready', () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity('performing at MAMA \'s 2020 ');
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
      // Start : commencer une partie
      case 'id':
        if(message.member.roles.some(r=>['Joueur'].includes(r.name))) {
          initJeu.initStat(message.author);
          return;
        }
        else {
          message.channel.send('Vous vous êtes déjà enregistré.');
        }
        break;
      case 'start':
        partie.nbJour = -2;
        partie.tuto = false;
        sfm.save(message.author.id, partie);
        initJeu.initJeu(message, client);
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

  // on charge les informations du joueur
  const partie = sfm.loadSave(user.id);
  // Action effectuée en fonction de la réaction
  switch(reaction.emoji.name) {
    // Choix d'un personnage prédéfini
    case '✅':
      choixPerso(reaction.message, partie);
      break;
    // Passer à l'évenement suivant
    case '➡':
      if(partie.numEvent == -1 && !partie.evenement) {
        const chanId2 = myBot.messageChannel(reaction.message, 'informations', partie);

        if(partie.tuto)
          fieldTextInfo = 'Voici le channel informations.\nAvant chaque prise d\'insuline, un graphique montrant l\'évolution de votre taux de glycémie apparaitra dans ce channel.';
        else
          fieldTextInfo = 'Un petit récapitulatif du taux de glycémie.';

        reaction.message.guild.channels.get(chanId2).send({embed: {
          color: 15013890,
          fields: [{
            name: 'Channel Informations',
            value: fieldTextInfo
          }]
        } });
      }
      event.event(reaction.message, partie, tabNR, tabER);
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
      }
  });
  return id;
};

/** Fonction qui écrit le texte explicatif sur le serveur Discord
* @param {string} message - Message discord
**/
function text(message) {

  // Supprime le message
  message.delete();

  const embed = new Discord.RichEmbed()
  .setColor(0x00AE86)
  .setTitle('Bienvenue dans Mellitus')

  .addField('Qu\'est ce que Mellitus ?', 'Jouant la consience du personnage choisi ou créé, Mellitus a pour but de vous apporter une aide, afin de vous apprendre de manière assez ludique comment gérer votre taux d’insuline, tout en gardant le côté serious game. De plus, de nombreux événements vont apparaître lors de la partie afin de développer votre adaptation aux circonstances. En fin de journée, vous aurez accés aux informations concernant votre personnage ainsi qu\'un récapitulatif de votre journée. Le but du jeu étant de rester en vie le plus longtemps possible.')
  .addField('Le diabète', 'Voici un lien qui va vous renvoyer sur un pdf qui vous expliquera plus en détail le diabète ➡ https://drive.google.com/open?id=1AZ9kk6WSVgL33GI2OUzjU2g6XPzKwNqX')
  .addField('Comment jouer ?', 'La partie est divisée en jour et chaque jour est une suite de choix. A chaque choix, ses conséquences.\n Durant la partie, vous ferez vos choix de 2 façons différentes : sous forme de texte ou sous forme de boutons.\nLe jeu n\'étant pas terminé, il ne peut accueillir qu\'un seul joueur à la fois.')
  .addField('Lancer le jeu : ', '/start')
  .addField('Arrêt d\'urgence : ', '/end')
  .addField('Autres commandes : ', '/help')

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
