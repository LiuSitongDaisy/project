var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* Util */
var getString = (date) => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

var renderTransaction = (res) => {
	res.render('transaction', {
		title: 'Transaction',
		petid: petid,
		s_date: getString(s_date),
		e_date: getString(transaction.e_date),
		transaction: transaction
	})
}

var renderRequest = (res) => {
	res.render('request', {
		title: 'Request',
		userid: userid,
		petid: petid,
		s_date: getString(s_date),
		e_date: getString(request.e_date),
		pet: pet,
		request: request,
		caretakers: caretakers
	})
}

/* SQL Query */

/* Data */


/* Err msg */

// GET
router.get('/:userid/:petid/:s_date', function(req, res, next) {
	userid = req.params.userid; //TODO: Need to replace with user session id
	pool.query(petowner_exist_query, [userid], (err, data) => {
		if (err !== undefined) {
			res.render('connection_error');
		} else {
			if (data.rows.length > 0) {
				petid = req.params.petid;
				s_date = new Date(req.params.s_date);
				pool.query(pet_exist_query, [petid, userid], (err, data) => {
					if (data.rows.length > 0) {
						pet = data.rows[0];
						pool.query(request_exist_query, [petid, getString(s_date)], (err, data) => {
							if (data.rows.length > 0) {
								request = data.rows[0];
								pool.query(confirmed_transaction_exist_query, [petid, getString(s_date)], (err, data) => {
									if (data.rows.length > 0) {
										transaction = data.rows[0];
										renderTransaction(res);
									} else {
										transaction = null;
										pool.query(all_ct_query, [petid, getString(s_date)], (err, data) => {
											caretakers = data.rows;
											renderRequest(res);
										});
									}
								})
							} else {
								res.render('not_found_error', {component: 'request'});
							}
						})
					} else {
						res.render('not_found_error', {component: 'pet id'});
					}
				})
			} else {
				res.render('not_found_error', {component: 'pet owner userid'});
			}
		}
	});
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
