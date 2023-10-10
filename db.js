

var mysql      = require('mysql');

const connection = mysql.createPool({
  host: '199.247.17.50',
  user: 'pgryvcxxdw',
  password: 'p7jaVFySXr',
  database: 'pgryvcxxdw',
  multipleStatements: true,
  port: 3306
});





module.exports = connection;




