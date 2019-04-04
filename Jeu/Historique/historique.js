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
	let listmort = [];
	const chanId = myBot.messageChannel(message, 'historique', partie);
	partie.enfants[0].forEach(function(element) {
		if(Math.random() < 0.2) {
			md.mortDescendant(message, partie, element);
			listmort.push(partie.nom[element]);
			console.log(partie.nom[element]);
			console.log(element);
		}
	});

	let embed = new Discord.RichEmbed()
	.setColor(15013890)
	.setTitle('Journal de bord - Année' + partie.annee)
	.addField('Prenom est né(e).')
	.addField('Aled les amis');
	if (listmort.length > 0) {
		console.log('ok');
		listmort.forEach(function(element) {
			embed = embed.addField(element + ' est mort');
		});

	}


	// Embed affichant le journal de bord, les récapitulatifs des activités et des repas
	message.guild.channels.get(chanId).send({ embed })
}
