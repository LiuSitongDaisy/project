var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* Util */
var getString = (date) => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

var renderPage = (res) => {
	res.render('all_caretakers', {
		title: 'All registered care takers',
		caretakers: caretakers
	})
}

/* SQL Query */
var all_ct_query = 'SELECT CT.userid AS userid, U.name AS name, U.gender AS gender, CT.rating AS rating,\n' +
	'  CASE WHEN CT.userid IN (SELECT userid FROM FullTimeCareTakers) THEN \'Full time\' ELSE \'Part time\' END\n' +
	'FROM CareTakers CT NATURAL JOIN Users U';
/*
SELECT CT.userid AS userid, U.name AS name, U.gender AS gender, CT.rating AS rating,
  CASE WHEN CT.userid IN (SELECT userid FROM FullTimeCareTakers) THEN 'Full time' ELSE 'Part time' END
FROM CareTakers CT NATURAL JOIN Users U
 */

/* Data */
var caretakers;

/* Err msg */

// GET
router.get('/', function(req, res, next) {
	pool.query(all_ct_query, (err, data) => {
		caretakers = data.rows;
		renderPage(res);
	})
});

// POST
router.post('/:userid/:petid/:s_date/review', function(req, res, next) {
	userid = req.params.userid; //TODO: Need to replace with user session id
	petid = req.params.petid;
	s_date = new Date(req.params.s_date);
	var rate = req.body.rate;
	var review = req.body.review;
	pool.query(save_rate_query, [rate, petid, getString(s_date)], (err, data) => {
		console.log("Update rate to " + rate);
		pool.query(save_review_query, [review, petid, getString(s_date)], (err, data) => {
			console.log("Update review");
			res.redirect("/request/" + userid + "/" + petid + "/" + getString(s_date));
		})
	});
});

router.post('/:userid/:petid/:s_date/edit_request', function(req, res, next) {
	userid = req.params.userid; //TODO: Need to replace with user session id
	petid = req.params.petid;
	s_date = new Date(req.params.s_date);
	var transfer_type = req.body.transfer;
	var payment_method = req.body.payment;
	pool.query(update_transfer_query, [transfer_type, petid, getString(s_date)], (err, data) => {
		pool.query(update_payment_query, [payment_method, petid, getString(s_date)], (err, data) => {
			console.log("Updated the transaction of " + petid + " on " + getString(s_date) + " with transfer type " + transfer_type + " and payment method " + payment_method);
			res.redirect("/request/" + userid + "/" + petid + "/" + getString(s_date));
		})
	})
});

module.exports = router;
