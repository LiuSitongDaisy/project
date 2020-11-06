var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* Util */
var getString = (date) => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();

/* SQL Query */
var ct_info_query = 'SELECT U.userid AS userid, U.name AS name, U.gender AS gender, U.address AS address,\n' +
	'  CASE WHEN U.userid IN (SELECT userid FROM FullTimeCareTakers) THEN \'Full time\' ELSE \'Part time\' END AS type,\n' +
	'  CT.rating AS rating\n' +
	'FROM Users U NATURAL JOIN CareTakers CT\n' +
	'WHERE userid=$1';
/*
SELECT U.userid AS userid, U.name AS name, U.gender AS gender, U.address AS address,
  CASE WHEN U.userid IN (SELECT userid FROM FullTimeCareTakers) THEN 'Full time' ELSE 'Part time' END AS type,
  CT.rating AS rating
FROM Users U NATURAL JOIN CareTakers CT
WHERE userid=$1
 */
var good_pc_query = 'SELECT P.category AS category\n' +
	'FROM (Pets P NATURAL JOIN CanTakeCare CTC) INNER JOIN\n' +
	'    (SELECT (T1.rate - avg) / stddev AS rate, T1.pet_id AS pet_id, T1.ct_id AS ct_id\n' +
	'    FROM (Transactions T1 INNER JOIN Pets P1 ON T1.pet_id=P1.petid) INNER JOIN (\n' +
	'        SELECT AVG(T2.rate) AS avg, STDDEV(T2.rate) AS stddev, P2.category AS category\n' +
	'        FROM Transactions T2 INNER JOIN Pets P2 ON T2.pet_id=P2.petid\n' +
	'        GROUP BY P2.category\n' +
	'        ) PT ON P1.category=PT.category\n' +
	'    WHERE T1.status=\'Confirmed\') T\n' +
	'    ON P.petid=T.pet_id AND CTC.ct_id=T.ct_id\n' +
	'WHERE CTC.ct_id=$1\n' +
	'GROUP BY P.category\n' +
	'HAVING COUNT(*) >= 10\n' +
	'ORDER BY AVG(T.rate) DESC LIMIT 5';
/*
SELECT P.category AS category
FROM (Pets P NATURAL JOIN CanTakeCare CTC) INNER JOIN
    (SELECT (T1.rate - avg) / stddev AS rate, T1.pet_id AS pet_id, T1.ct_id AS ct_id
    FROM (Transactions T1 INNER JOIN Pets P1 ON T1.pet_id=P1.petid) INNER JOIN (
        SELECT AVG(T2.rate) AS avg, STDDEV(T2.rate) AS stddev, P2.category AS category
        FROM Transactions T2 INNER JOIN Pets P2 ON T2.pet_id=P2.petid
        GROUP BY P2.category
        ) PT ON P1.category=PT.category
    WHERE T1.status='Confirmed') T
    ON P.petid=T.pet_id AND CTC.ct_id=T.ct_id
WHERE CTC.ct_id='lphittiplace4'
GROUP BY P.category
HAVING COUNT(*) >= 10
ORDER BY AVG(T.rate) DESC
 */

/* Data */
var ct_id;
var ct;
var pcs;

/* Err msg */

// GET
router.get('/:userid', function(req, res, next) {
	ct_id = req.params.userid;
	pool.query(ct_info_query, [ct_id], (err, data) => {
		ct = data.rows[0];
		pool.query(good_pc_query, [ct_id], (err, data) => {
			pcs = data.rows;
			res.render('open_caretaker_profile', {
				title: 'View care taker profile',
				ct: ct,
				pcs: pcs
			})
		})
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
