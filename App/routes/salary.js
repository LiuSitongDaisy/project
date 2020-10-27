var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var all_caretaker_query = 'SELECT userid FROM CareTakers';
var caretaker_exist_query = 'SELECT 1 FROM CareTakers WHERE userid=$1';
var salary_record = 'SELECT salary FROM Salary';
var salary_exist_query = 'SELECT 1 FROM Salary WHERE userid=$1';
var insert_pet_query = 'INSERT INTO Pets VALUES ';

/* Data */
var userid;
var caretaker;
var salary;
var salary_policy;

/* Err msg */
var connectionSuccess;
var isCareTaker;
var SalaryErr = "";

// GET
router.get('/:userid', function(req, res, next) {
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

// POST
router.post('/:userid', function(req, res, next) {
	// Retrieve Information
	var salary  = req.body.salary;
	var salary_policy = req.body.salary_policy;
	var owner = req.params.userid; //TODO: Need to replace with user session id
	var requirements = req.body.requirements;

	// Validation
	var found_salary;
	pool.query(salary_exist_query, [salary], (err, data) => {
		found_salary = data.rows.length > 0;
	});
	if (found_salary) {
		SalaryErr = "* The userid already exists. Please choose another pet id.";
	} else if (salary === "") {
		salaryErr = "* The userid cannot be empty. Please provide an id.";
	} else {
		var isValid = true;
		var str = salary.toString();
		var len = str.length;
		for (var i=0; i<len && isValid; i++) {
			var c = str.charAt(i);
			if (!( (c < '9' && c > '0') || (c = '.'))) {
				isValid = false;
				salaryErr = "* The salary should consist of numbers, and . only.";
			}
		}
		if (isValid) {
			salaryErr = "";
		}
	}
});

module.exports = router;
