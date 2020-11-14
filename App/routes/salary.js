var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var all_caretaker_query = 'SELECT userid FROM CareTakers';
var caretaker_exist_query = 'SELECT 1 FROM CareTakers WHERE userid=$1';
var salary_record = 'SELECT amount FROM Salary WHERE userid =$1';

/* Data */
var userid;
var salary;
var month;
var year;

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
	month = req.query.month;
	year = req.query.year;
	if (connectionSuccess) {
		pool.query(caretaker_exist_query, [userid], (err, data) => {
			isCareTaker = data.rows.length > 0;
		});
		if (isCareTaker) {
			salary_record += "'" + userid + "' AND month ='" + month + "'AND year='" + year + "'";
			pool.query(salary_record, function(err, data) {
					salary = data.rows;
				});
			res.render('salary', {
				title: 'View salary',
				userid: req.params.userid,
				salary:salary,
				month:req.params.month,
				year:req.params.year
			});
		} else {
			res.render('not_found_error', {component: 'userid'});
		}
	} else {
		res.render('connection_error');
	}
});



module.exports = router;
