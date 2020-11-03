var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var all_caretaker = 'SELECT userid FROM CareTakers';
var all_transaction = 'SELECT * FROM Transactions';

/* Data */
var userid;
var caretaker;
var transaction;

// GET
router.get('/:summary_info', function(req, res, next) {
	pool.query(all_transaction, (err, data) => {
		if (err !== undefined) {
			connectionSuccess = false;
		} else {
			connectionSuccess = true;
			transaction = data.rows;
		}
		res.render('summary_info',{userid:req.session.user.userid});
	});
	});


module.exports = router;