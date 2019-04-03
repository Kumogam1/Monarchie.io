const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('../token.json');
client.login(config.token);

const sfm = require('./saveFileManagement.js');
const fj = require('./finJeu.js');
const is = require('./initJeu.js');
const myBot = require('./myBot.js');

/** Fonction terminant la partie
* @param {string} message - Message discord
**/
exports.finJeu = function finJeu(message) {

	// Si le joueur est en jeu
	if(message.member.roles.some(r=>['Joueur'].includes(r.name))) {
		// Supprimer les channels
		deletChannel(message);

		// Supprimer/retirer les roles
		deletRole(message);

		// Reinitialiser les informations du joueur
		is.initStat(message.author);

		// Supprimer le message /quit
		message.delete();
	}
	else {
		message.channel.send('Vous n\'êtes pas en jeu.');
	}
};

/** Fonction enlevant les roles de l'utilisateur
* @param {string} message - Message discord
**/
function deletRole(message) {

	// Recherche du role à retirer
	const suppRoleJoueur = message.guild.roles.find(role => {
		if(role.name == 'Joueur') {
			return role;
		}
	});

	// On retire ce role
	message.member.removeRole(suppRoleJoueur)
	.then(() => {
		// Recherche du role à supprimer
		const suppRolePerso = message.guild.roles.find(role => {
			if(role.name == 'Joueur-' + message.author.username) {
				return role;
			}
		});
		// On supprime ce role
		suppRolePerso.delete();
	});
}

/** Fonction supprimant les channels de la partie de l'utilisateur
* @param {string} message - Message discord
**/
function deletChannel(message) {

	// Chargement des informations du joueur
	const partie = sfm.loadSave(message.author.id);

	// Liste des channels de la partie du joueur
	const listedChannels = fj.listChan(message, partie);

	// Suppression des channels de la liste
	listedChannels.forEach(channel => {
		channel.overwritePermissions(message.guild.roles.find(role => {
			if(role.name == '@everyone') {
				return role;
			}
		}), {
			'VIEW_CHANNEL': false,
			'CONNECT': false,
			'WRITE': false,
		})
		.then((chan) => {
			chan.delete();
		});
	});
}

// WIP
/** Fonction de message de fin de partie
* @param {string} message - Message discord
* @param {Object} partie - Objet json de la partie
* @param {number} partie.numJour - Numéro du jour actuel
**/
exports.msgFin = function msgFin(message, partie) {

	// Suppression du message /end
	message.delete();

	// Si le joueur est en partie
	if(message.member.roles.some(r=>['Joueur'].includes(r.name)) || message.author.bot) {

		// Si le message ce situe dans le channel hub
		if(message.channel.name == 'hub') {

			// On nettoie le channel des message
			myBot.clear(message)
			.catch((err) => {
				console.log(err)
			});

			let textMort = '';
			let text = '';

			// On écrit le message
			const embed = new Discord.RichEmbed()
			.setColor(15013890)
			.setImage('https://imgcs.artprintimages.com/img/print/peinture/color-me-happy-game-over-red_a-g-15238157-0.jpg')
			.addField('__**C\'est perdu ou gagné ? A toi de juger !**__', textMort + 'Vous avez tenu ' + partie.numJour + ' jour(s).\n' + text + '\n\n')
			.addField('Pour quitter la partie : ', '/quit');

			message.channel.send({ embed });
		}
	}
	else {
		message.channel.send('Vous n\'êtes pas en jeu.');
	}
}

/** Fonction listant les channels de la partie de l'utilisateur
* @param {string} message - Message discord
* @param {Object} partie - Objet json de la partie
* @param {string} partie.chanGrp - Identifiant du channel catégorie
**/
exports.listChan = function listChan(message, partie) {

	// Creation d'une liste des channels que le joueur peut voir
	const listedChannels = [];

	// On met dans cette liste tous les channels de la partie du joueur
	message.guild.channels.forEach(channel => {
		if (channel.parentID == partie.chanGrp || channel.id == partie.chanGrp) {
			listedChannels.push(channel);
		}
	});

	return listedChannels;
};
