var express = require('express');
var router = express.Router();
var url = require('url');
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

var refreshPage = (res) => {
	res.render('services', {
		title: 'Services',
		userid: userid,
		confirmed_transactions: confirmed_transactions,
		pending_transactions: pending_transactions
	});
}

/* SQL Query */
var all_caretakers_query = 'SELECT 1 FROM Caretakers';
var caretaker_exist_query = 'SELECT 1 FROM Caretakers WHERE userid=$1';
var confirmed_transactions_query = 'SELECT requests.pet_id, TO_CHAR(requests.s_date, \'YYYY-MM-DD\') AS s_date, TO_CHAR(requests.e_date, \'YYYY-MM-DD\') AS e_date, transactions.cost, requests.transfer_type, requests.payment_type, transactions.rate, transactions.review FROM Transactions, Requests WHERE transactions.ct_id=$1 AND transactions.status=\'Confirmed\' AND requests.pet_id = transactions.pet_id AND requests.s_date = transactions.s_date';
var pending_transactions_query = 'SELECT requests.pet_id, TO_CHAR(requests.s_date, \'YYYY-MM-DD\') AS s_date, TO_CHAR(requests.e_date, \'YYYY-MM-DD\') AS e_date, transactions.cost, requests.transfer_type, requests.payment_type FROM Transactions, Requests WHERE transactions.ct_id=$1 AND transactions.status=\'Pending\' AND requests.pet_id = transactions.pet_id AND requests.s_date = transactions.s_date';
var accept_transaction_query = 'UPDATE Transactions SET status = \'Confirmed\' WHERE pet_id=$1 AND s_date=$2 AND ct_id=$3';
var decline_transaction_query = 'UPDATE Transactions SET status = \'Declined\' WHERE pet_id=$1 AND s_date=$2 AND ct_id=$3';

/* Data */
var userid;
var confirmed_transactions;
var pending_transactions;

/* Err msg */


// GET
router.get('/:userid', function(req, res, next) {
	userid = req.params.userid; //TODO: May need to update with session user id
	pool.query(all_caretakers_query, (err, data) => {
		if (err !== undefined) {
			res.render('connection_error');
		} else {
			pool.query(caretaker_exist_query, [userid], (err, data) => {
				if (data.rows.length > 0) {
						pool.query(confirmed_transactions_query, [userid], (err, data) => {
							if (data.rows.length > 0) {
								confirmed_transactions = data.rows;
								pool.query(pending_transactions_query, [userid], (err, data) => {
									if (data.rows.length > 0) {		
										pending_transactions = data.rows;
										refreshPage(res);
									}
								});																
							}
						});
				} else {
					res.render('not_found_error', {component: 'userid'});
				}
			});
		}
	});
});

// POST
router.post('/:userid/:petid/:s_date/accept', function(req, res, next) {
	userid = req.params.userid;
	petid = req.params.petid;
	s_date = req.params.s_date;
	pool.query(accept_transaction_query, [petid, s_date, userid], (err, data) => {
		console.log("Accept transaction");
		res.redirect('/services/' + userid);			
	});
})

router.post('/:userid/:petid/:s_date/decline', function(req, res, next) {
	userid = req.params.userid;
	petid = req.params.petid;
	s_date = req.params.s_date;
	pool.query(decline_transaction_query, [petid, s_date, userid], (err, data) => {
		console.log("Decline transaction");
		res.redirect('/services/' + userid);
	});
})

module.exports = router;

	