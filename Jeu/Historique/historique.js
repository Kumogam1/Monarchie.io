const Discord = require('discord.js');
const myBot = require('../Main/myBot.js');

/** Fonction qui récapitule les actions faites par l'utilisateur pendant la journée
* @param {string} message - Message discord
* @param {Object} partie - Objet json de la partie
* @param {string[]} partie.activite - Liste des actions faites par l'utilisateur
* @param {number} partie.numJour - Numéro du jour
**/
exports.historique = function(message, partie) {

	const chanId = myBot.messageChannel(message, 'historique', partie);

	// Embed affichant le journal de bord, les récapitulatifs des activités et des repas
	const embed = new Discord.RichEmbed()
	.setColor(15013890)
	.setTitle('Journal de bord - Année 1300')
	.addField('Prenom est né(e).')
	.addField('Prenom est mort.')
	.addField('Aled les amis')

	message.guild.channels.get(chanId).send({ embed })
}
