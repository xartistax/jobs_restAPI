

var mysql      = require('mysql');

const pool = mysql.createPool({
  host: '199.247.17.50',
  user: 'pgryvcxxdw',
  password: 'p7jaVFySXr',
  database: 'pgryvcxxdw',
  connectionLimit:10
});





module.exports = pool;




