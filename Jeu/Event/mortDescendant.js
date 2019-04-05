const sfm = require('../Main/saveFileManagement.js');

exports.mortDescendant = function(partie, ind) {
  partie.enfants.splice(ind, 1);
  console.log(partie.enfants);
  sfm.save(partie.player, partie);
};
