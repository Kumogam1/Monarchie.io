const sfm = require('../Main/saveFileManagement.js');

exports.mortDescendant = function(message, partie, id) {
  const index = partie.enfants.indexOf(id);
  if (index > -1) {
    partie.enfants.splice(index, 1);
  }
  sfm.save(partie.player, partie);
};
