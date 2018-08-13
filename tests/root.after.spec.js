const fs = require('fs');

after(() => {
  // delete the temp db file created for testing
  fs.unlink(process.env.SIHA_DBFILE);
});
