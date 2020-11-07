var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')

const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var sql_query = 'SELECT * FROM AppUsers';

router.get('/', function(req, res, next) {
	pool.query(sql_query, (err, data) => {
	    console.log(err);
		res.render('test', { title: 'Database Connect', data: data.rows });
	});
});

module.exports = router;
