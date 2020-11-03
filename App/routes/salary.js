var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var all_caretaker_query = 'SELECT userid FROM CareTakers';
var caretaker_exist_query = 'SELECT 1 FROM CareTakers WHERE userid=$1';
var salary_record = 'SELECT salary FROM Salary WHERE userid =$1'; // need to update manually?

/* Data */
var userid;
var salary;
var salary_policy;

/* Err msg */
var connectionSuccess;
var isCareTaker;
var SalaryErr = "";

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
	userid = req.params.userid; //TODO: Need to replace with user session id
	if (connectionSuccess) {
		pool.query(caretaker_exist_query, [userid], (err, data) => {
			isCareTaker = data.rows.length > 0;
		});
		if (isCareTaker) {
			pool.query(salary_record, (err, data) => {
				salary = data.rows;
			});
			res.render('salary', {
				title: 'View salary summary',
				salary:salary,
				userid: req.params.userid
			});
		} else {
			res.render('not_found_error', {component: 'userid'});
		}
	} else {
		res.render('connection_error');
	}
});



module.exports = router;
