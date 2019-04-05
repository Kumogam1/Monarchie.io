const sfm = require('../Main/saveFileManagement.js');

exports.mortDescendant = function(partie, ind) {
  partie.enfants.splice(ind);
  sfm.save(partie.player, partie);
};
