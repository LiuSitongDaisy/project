var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var all_caretaker_query = 'SELECT userid FROM CareTakers';
var caretaker_exist_query = 'SELECT 1 FROM CareTakers WHERE userid=$1';
var salary_record = 'SELECT salary FROM Salary WHERE userid =$1'; // need to update manually?
var salary_policy = 'SELECT c.daily_price FROM CanTakeCare WHERE userid =$1';

/* Data */
var userid;
var salary;

/* Err msg */
var connectionSuccess;
var isCareTaker;

// GET
router.get('/salary', function(req, res, next) {
	pool.query(all_caretaker_query, (err, data) => {
		if (err !== undefined) {
			connectionSuccess = false;
		} else {
			connectionSuccess = true;
			caretaker = data.rows;
		}
	});
	userid = req.query.userid; 
	if (connectionSuccess) {
		pool.query(caretaker_exist_query, [userid], (err, data) => {
			isCareTaker = data.rows.length > 0;
		});
		if (isCareTaker) {
			pool.query(salary_record, [userid], function(err, data) {
					salary = data.rows;
				});
			res.render('salary', {
				title: 'View salary',
				salary:salary,
				userid: req.params.userid,
				salary_policy: salary_policy
			});
		} else {
			res.render('not_found_error', {component: 'userid'});
		}
	} else {
		res.render('connection_error');
	}
});



module.exports = router;
