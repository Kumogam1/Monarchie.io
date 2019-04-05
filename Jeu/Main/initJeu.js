const Discord = require('discord.js');
const sfm = require('./saveFileManagement.js');
const myBot = require('./myBot.js');
// Dossier des personnages
const perso = require('../Personnages/perso.json');
const initJeu = require('./initJeu.js');
const gt = require('../Event/gestionTour.js');

const opi = require('../Personnages/opinion.json');

/** Fonction initialisant la partie
* @param {string} message - Message discord
* @param {Client} client - Le Client utilisé pour le jeu
**/
exports.initJeu = function initJeu(message, client) {

	if(!message.member.roles.some(r=>['Joueur'].includes(r.name))) {

		// On récupère les informations concernant le joueur
		const partie = sfm.loadSave(message.author.id);
		const eventName = 'Joueur';

		// Création et assignation des roles au joueur
		const rolePers = initRole(message, eventName, client);

		// Création des channels
		initChannelGrp(message, partie, message.author.username, rolePers);

		message.delete();
		message.channel.send(message.author.username + ' a lancé une partie !');

	}
	else {
		message.channel.send('Vous êtes déjà en jeu.');
	}
};

/** Fonction créant un role joueur à l'utilisateur
* @param {string} message - Message discord
* @param {string} eventName - Prefix du role de l'utilisateur
* @param {Client} client - Le Client utilisé pour le jeu
* @return {string} Nom du role joueur de l'utilisateur
**/
function initRole(message, eventName, client) {

	// Nom du role
	const nomRole = eventName + '-' + message.author.username;

	// Recherche du role 'Joueur'
	const myRole = message.guild.roles.find(role => {
		if(role.name == 'Joueur') {
			return role;
		}
	});

	// Ajout du role 'Joueur' au joueur
	message.member.addRole(myRole);

	message.guild.createRole({
		name: nomRole,
		color: 0x00FF00,
		permissions: 0,
	}).then(role => {
		// Ajout du role 'Joueur-pseudo' au joueur
		message.member.addRole(role, nomRole)
		.catch(error => client.catch(error));
	})
	.catch(error => client.catch(error));
	return nomRole;
}

// WIP
/** Fonction créant un channel visible que pour l'utilisateur
* @param {string} message - Message discord
* @param {Object} partie - Objet json de la partie
* @param {string} rolePers - Nom du role joueur de l'utilisateur
* @param {string} channelName - Nom du channel à créer
* @param {Snowflake} chanGrpId - Identifiant du channel catégorie
* @return {string} Texte vérifiant l'ajout
**/
function initChannel(message, partie, rolePers, channelName, chanGrpId) {

	const server = message.guild;
	// Creation d'un channel textuel
	server.createChannel(channelName, 'text')

	.then((chan) => {
		// Place le channel textuel dans la catégorie de jeu
		chan.setParent(chanGrpId)
		.then((chan2) => {
			// On établit les permissions
			chan2.overwritePermissions(message.guild.roles.find(role => {
				if(role.name == '@everyone') {
					return role;
				}
			}), {
				'CREATE_INSTANT_INVITE' : false,
				'VIEW_CHANNEL': false,
				'CONNECT': false,
				'SEND_MESSAGES': false
			});

			if(channelName == 'Historique' || channelName == 'Statistiques') {
				chan2.overwritePermissions(message.guild.roles.find(role => {
					if(role.name == rolePers) {
						return role;
					}
				}), {
					'VIEW_CHANNEL': true,
					'CONNECT': true,
					'SEND_MESSAGES': false
				});
			}
			else{
				chan2.overwritePermissions(message.guild.roles.find(role => {
					if(role.name == rolePers) {
						return role;
					}
				}), {
					'VIEW_CHANNEL': true,
					'CONNECT': true,
					'SEND_MESSAGES': true
				});
			}

			// on ajoute le channel a la sauvegarde de partie
			partie[channelName] = chan2.id;

			if(channelName == 'Hub')
				bienvenue(message);
		}
		).catch(console.error);
	}).catch(console.error);

	return '```Added```';
}


// WIP
/** Fonction initialisant les channels et les caractéristique de l'utilisateur
* @param {string} message - Message discord
* @param {Object} partie - Objet json de la partie
* @param {Snowflake} partie.chanGrp - Identifiant du channel catégorie
* @param {Snowflake} partie.player - Identifiant de l'utilisateur
* @param {number} partie.partJour - Partie de la journée
* @param {number} partie.numJour - Numéro du jour
* @param {number} partie.numEvent - Numéro de l'évenement
* @param {number} partie.insuline - Activateur de la prise d'insuline
* @param {string[]} partie.activite - Liste des actions faites par l'utilisateur
* @param {string[]} partie.consequence - Liste des consequences de l'utilisateur
* @param {number} partie.glycemie - Taux de glycémie de l'utilisateur
* @param {number[]} partie.tabGlycemie - Tableau de tous les taux de glycémie de l'utilisateur
* @param {string} channelGrpName - Nom du channel catégorie
* @param {string} rolePers - Nom du role joueur de l'utilisateur
* @return {Snowflake} Identifiant du channel catégorie
**/
function initChannelGrp(message, partie, channelGrpName, rolePers) {
	const server = message.guild;
	let res = '';
	server.createChannel(channelGrpName, 'category')
	.then(async chanGrp => {

		// On initialise toutes les informations du joueur
		// WIP
		res = chanGrp.id;
		partie.chanGrp = chanGrp.id;
		partie.player = message.author.id;
		partie.nom = '';
		partie.sexe = '';
		partie.age = 20;

		partie.annee = 1300;
		partie.choixPerso = 0;

		partie.mort = false;

		partie.feteOrganise = true;
		partie.guerreDeclare = true;


		initChannel(message, partie, rolePers, 'Hub', res);
		initChannel(message, partie, rolePers, 'Historique', res);
		initChannel(message, partie, rolePers, 'Statistiques', res);
		initChannel(message, partie, rolePers, 'Conseil', res);
		initChannel(message, partie, rolePers, 'Actions', res);
		initChannel(message, partie, rolePers, 'Famille', res);
		sfm.save(message.author.id, partie);
	})
	.catch(console.error);
	return res;
}

/** Fonction qui écrit le message de lancement de partie
* @param {string} message - Message discord
**/
function bienvenue(message) {

	// On récupère les informations du joueur
	const partie = sfm.loadSave(message.author.id);

	// On cherche l'id du channel 'hub'
	const chanId = myBot.messageChannel(message, 'hub', partie);

	if(partie.tuto) {
		titre = 'Tutoriel';
		text = 'Ceci est le tutoriel du jeu Medieval.io.';
	}
	else{
		titre = 'Jeu';
		text = 'Vous allez jouer à Medieval.io. Bon jeu.';
	}

	const embed = new Discord.RichEmbed()
	.setColor(15013890)
	.setTitle('Bienvenue dans Medieval.io.')
	.setImage('https://images.pexels.com/photos/34223/mont-saint-michel-france-normandy-europe.jpg?cs=srgb&dl=ancient-architecture-castle-34223.jpg')

	.addField(titre, text)
	.addField('Continuer : ', '✅')

	message.guild.channels.get(chanId).send({ embed })
	.then(async function(mess) {
		await mess.react('✅');
	});
}

// WIP
/** Fonction initialisant les channels et les caractéristiques de l'utilisateur
* @param {string} user - Message discord
**/
exports.initStat = function initStat(user) {

	// Création d'une collection comprenant les informations
	const partie = {};

	// Mise à zero des informations
	partie.chanGrp = '';
	partie.player = user.id;
	partie.nbJour = 0;
	partie.numJour = -1;

	sfm.save(user.id, partie);
};

exports.accueil = function accueil(message, partie)
{
	myBot.clear(message);
	const embed = new Discord.RichEmbed()
	.setTitle('Le roi est mort, vive le roi !')
	.setColor(808367)
	.setTimestamp() // Crée de l'espace
	.addField('Démarrage', 'Choisissez la personne que vous allez incarner !')
	message.channel.send({ embed })
	.then(async function(mess){
		for (var i=0; i < 5; i++)
		{
			myBot.writePerso(mess, i);
		}
		await initJeu.choixPerso(mess, partie);
	});
};

exports.choixPerso = function choixPerso(message, partie)
{
	const chanId = myBot.messageChannel(message, 'hub', partie);

	const embed = new Discord.RichEmbed()
	.setColor(15013890)
	.setTitle('Choix du personnage')
	.addField('Sélection', 'Pour selectionner votre personnage, choisissez son icone ci-dessous')

	message.guild.channels.get(chanId).send({ embed })
	.then(async function(mess) {
		await mess.react('👴');
		await mess.react('👱');
		await mess.react('👲');
		await mess.react('👵');
		await mess.react('👸');
});
};

// Fonctions menu action
exports.actions = function(message, partie) {
	const chanId = myBot.messageChannel(message, 'actions', partie);

	const embed = new Discord.RichEmbed()
	.setColor(15013890)
	.setTitle('Actions')
	.addField('Organiser une fête 🎊', 'Organiser une fêtes pour améliorer vos relations avec la noblesse')
	.addField('Déclarer une guerre 🏹', 'Déclarer la guerre à un pays voisin pour agrandir votre térritoire et améliorer votre image aux yeux de tous')

	message.guild.channels.get(chanId).send({ embed })
	.then(async function(mess) {
		await mess.react('🎊');
		await mess.react('🏹');
	});
}

exports.initPerso = function(message, numPerso, partie) {

	partie.id = perso.id[numPerso];
	partie.nom = perso.nom[numPerso];
	partie.sexe = perso.sexe[numPerso];
	partie.age = perso.age[numPerso];

	if ( perso.epoux[numPerso] != null) {
	partie.epoux = [perso.nom[perso.epoux[numPerso] - 1], perso.age[perso.epoux[numPerso] - 1],perso.sexe[perso.epoux[numPerso] - 1]];

	}
	else {
		partie.epoux = null;
	}

	partie.role = perso.role[numPerso];
	var enfants = perso.enfants[numPerso];
	var gosses =[];
	for ( var i in enfants) {
		var e = [];
		e.push(i);
		e.push(perso.nom[enfants[i] - 1])
		e.push(perso.age[enfants[i] - 1])
		e.push(perso.sexe[enfants[i] - 1]);
		if ( perso.epoux[enfants[i] - 1] == null) {

			e.push("");
			console.log( " YESSSSSSSSSSSSSSc'est bien null ");
		}
		else {
			e.push(perso.nom[perso.epoux[enfants[i] - 1] - 1]);
		}

		gosses.push(e);

	}
	partie.enfants = gosses;
	partie.aviClerge = opi.clerge;
	partie.aviArmee  = opi.armee;
	partie.aviAristo = opi.aristo;
	partie.loiesAdopt = [] ;
	sfm.save(partie.player, partie);
	gt.gTours(message, partie);

};
