const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');
const md = require('../Event/mortDescendant.js');

/** Fonction qui récapitule les actions faites par l'utilisateur pendant la journée
* @param {string} message - Message discord
* @param {Object} partie - Objet json de la partie
* @param {string[]} partie.activite - Liste des actions faites par l'utilisateur
* @param {number} partie.numJour - Numéro du jour
**/
exports.historique = function(message, partie) {
	let listmortId = [];
	let listmort = [];
	const chanId = myBot.messageChannel(message, 'historique', partie);

	for (var i = 0; i < partie.enfants.length; i++) {
		if(Math.random() < 0.2) {
			listmortId.push(i);
			listmort.push(partie.enfants[i]);
		}
	}
	for (var i = 0; i < listmort.length; i++) {
		md.mortDescendant(partie, listmort[i] - i);
	}

	let embed = new Discord.RichEmbed()
	.setColor(15013890)
	.setTitle('Journal de bord - Année' + partie.annee)
	.addField('Naissance !', 'Prénom est né(e).')
	if (listmort.length > 0) {
		let chaine = '';
		listmort.forEach(function(element) {
			console.log(element);
			chaine += element[1] + ' est mort, ';
		});
		embed = embed.addField('Mort', chaine);
	}


	// Embed affichant le journal de bord, les récapitulatifs des activités et des repas
	message.guild.channels.get(chanId).send({ embed })
}
