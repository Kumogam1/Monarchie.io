const Discord = require('discord.js');
const fs      = require('fs');
const auth    = require('./token.json');

const client = new Discord.Client();

client.on('ready', () => {
  console.log('Le bot à démarrer avec succès');
  client.user.setActivity('Monarchie.io');
  client.channels.find(x => x.name === 'quentin-test').send('J\'attends vos instructions') ;
});

//Fonction qui s'active lorsqu'un message est écrit
client.on('message', (message) => {

  //Si le message provient d'un bot ou qu'il ne contient pas le prefix approprié, on ne fait rien
	if (!message.content.startsWith(auth.prefix) || message.author.bot) return;

  else {
    //args est un tableau comprenant tous les arguments écrit après la commande
    const args = message.content.slice(auth.prefix.length).trim().split(/ +/g);

    //command est la commande écrite par le joueur
    const command = args.shift().toLowerCase();

    if(command == 'id') {
      if(message.member.roles.some(r=>['Joueur'].includes(r.name))) {
        //finJeu.initStat(message.author);
        return;
      }
      else {
        message.channel.send('Vous vous êtes déjà enregistré.');
      }
    }

    let partie;
    //on charge les informations du joueur
    try{
      partie = sfm.loadSave(message.author.id);
    }
    catch(e) {
      //finJeu.initStat(message.author);
      //partie = sfm.loadSave(message.author.id);
    }


    switch(command) {
      //Start : commencer une partie
      case 'start':
        //partie.nbJour = -2;
        //partie.tuto = false;
        //sfm.save(message.author.id, partie);
        //initJeu.initJeu(message, client);
        console.log("coucoucoucouc") ;
        break;
      //Help : afficher toutes les commandes importantes
      case 'help':
        const embed = new Discord.RichEmbed()
        .setColor(15013890)
        .setTitle("**Help**")
        .addField("/start", "Commencer une partie")
        .addField("/tuto", "Commencer un tutoriel")
        .addField("/end", "Terminer une partie *(Seulement en partie)*")
        .addField("/insu", "Utiliser le stylo d'insuline *(Seulement en partie, 3 fois par jour)*")
        .addField("/soda", "Prendre un soda et augmenter son insuline *(Seulement en partie, 1 fois par jour)*")
        .addField("/gly", "Afficher un graphique montrant le taux de glycemie *(Seulement en partie)*")
        message.channel.send({ embed });
        break;
      //Tuto : commencer un tutoriel
      case 'tuto':
        partie.nbJour = 1;
        partie.tuto = true;
        sfm.save(message.author.id, partie);
        initJeu.initJeu(message, client);
        break;
      //End : terminer la partie
      case 'end':
        //finJeu.msgFin(message, partie);
        break;
      //Quit : quitter la partie
      case 'quit':
        //finJeu.finJeu(message);
        break;
      //Soda : prendre un soda
      case 'soda':
        if(partie.soda == true)
        {
          partie.glycemie += 0.3;
          partie.tabGlycemie[partie.tabGlycemie.length-1] += 0.3;
          partie.soda = false;
        }
        else{
          message.channel.send('Vous avez déjà pris votre canette quotidien !');
        }
        sfm.save(message.author.id, partie);
        message.delete();
        break;
      //Insu : prendre un stylo d'insuline
      case 'insu':
        if(partie.nbInsu > 0)
        {
          partie.glycemie -= 0.3;
          partie.tabGlycemie[partie.tabGlycemie.length-1] -= 0.3;
          partie.nbInsu--;
        }
        else{
          message.channel.send('Vous avez déjà pris vos stylos d\'insulines quotidien !');
        }
        sfm.save(message.author.id, partie);
        message.delete();
        break;
      //Gly : afficher le graphique du taux de glycémie
      case 'gly':
        as.graphString(message, partie);
        message.delete();
        break;
      //Id : création du fichier sauvegarde du joueur
      case 'id':
        //finJeu.initStat(message.author);
        break;
      //Text : afficher le texte de présentation du projet
      case 'text':
        text(message);
        break;
      case 'clear':
        myBot.clear(message);
        break;
      //Autre : commande inconnue
      default:
        message.channel.send('Commande inconnue');
        break;
		}
  }
});


client.login(auth.token);
