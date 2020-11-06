var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* Util */

var renderUserPage = (res) => {
	res.render('user_caretaker_profile', {
		title: 'View care taker profile',
		ct: ct,
		pcs: pcs,
		userid: userid,
		transactions: transactions,
		table: table
	})
}

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
var good_pc_query = 'SELECT P.category\n' +
	'FROM (Pets P NATURAL JOIN CanTakeCare CTC) INNER JOIN\n' +
	'    (SELECT CASE WHEN stddev = 0 THEN 0 ELSE (T1.rate - avg) / stddev END AS rate,\n' +
	'            T1.pet_id AS pet_id, T1.ct_id AS ct_id\n' +
	'    FROM (Transactions T1 INNER JOIN Pets P1 ON T1.pet_id=P1.petid) INNER JOIN (\n' +
	'        SELECT AVG(T2.rate) AS avg, STDDEV(T2.rate) AS stddev, P2.owner AS owner\n' +
	'        FROM Transactions T2 INNER JOIN Pets P2 ON T2.pet_id=P2.petid\n' +
	'        GROUP BY P2.owner\n' +
	'        ) PT ON P1.owner=PT.owner\n' +
	'    WHERE T1.status=\'Confirmed\') T\n' +
	'    ON P.petid=T.pet_id AND CTC.ct_id=T.ct_id\n' +
	'WHERE CTC.ct_id=$1\n' +
	'GROUP BY P.category\n' +
	'HAVING COUNT(*) >= 10\n' +
	'ORDER BY AVG(T.rate) DESC\n' +
	'LIMIT 3';
/*
SELECT P.category
FROM (Pets P NATURAL JOIN CanTakeCare CTC) INNER JOIN
    (SELECT CASE WHEN stddev = 0 THEN 0 ELSE (T1.rate - avg) / stddev END AS rate,
            T1.pet_id AS pet_id, T1.ct_id AS ct_id
    FROM (Transactions T1 INNER JOIN Pets P1 ON T1.pet_id=P1.petid) INNER JOIN (
        SELECT AVG(T2.rate) AS avg, STDDEV(T2.rate) AS stddev, P2.owner AS owner
        FROM Transactions T2 INNER JOIN Pets P2 ON T2.pet_id=P2.petid
        GROUP BY P2.owner
        ) PT ON P1.owner=PT.owner
    WHERE T1.status='Confirmed') T
    ON P.petid=T.pet_id AND CTC.ct_id=T.ct_id
WHERE CTC.ct_id='lphittiplace4'
GROUP BY P.category
HAVING COUNT(*) >= 10
ORDER BY AVG(T.rate) DESC
LIMIT 3
 */
var user_type_query = 'SELECT CASE\n' +
	'WHEN $1 IN (SELECT userid FROM PSCAdministrators) THEN \'admin\'\n' +
	'WHEN $1 NOT IN (SELECT userid FROM Users) THEN \'none\'\n' +
	'WHEN $1 NOT IN (SELECT userid FROM CareTakers) THEN \'owner\'\n' +
	'WHEN $1 NOT IN (SELECT userid FROM PetOwners) THEN \'taker\'\n' +
	'ELSE \'both\'\n' +
	'END AS value';
/*
SELECT CASE
WHEN $1 IN (SELECT userid FROM PSCAdministrators) THEN 'admin'
WHEN $1 NOT IN (SELECT userid FROM Users) THEN 'none'
WHEN $1 NOT IN (SELECT userid FROM CareTakers) THEN 'owner'
WHEN $1 NOT IN (SELECT userid FROM PetOwners) THEN 'taker'
ELSE 'both'
END AS value
 */
var all_transaction_query = 'SELECT T.pet_id AS petid, R.s_date AS s_date , R.e_date AS e_date, T.cost AS cost, T.rate AS rate, T.review AS review, P.category AS category, P.owner AS owner\n' +
	'FROM (Transactions T NATURAL JOIN Requests R) INNER JOIN Pets P ON T.pet_id=P.petid\n' +
	'WHERE T.ct_id=$1 AND T.status=\'Confirmed\'\n' +
	'ORDER BY s_date DESC';
/*
SELECT T.pet_id AS petid, R.s_date AS s_date , R.e_date AS e_date, T.cost AS cost, T.rate AS rate, T.review AS review, P.category AS category, P.owner AS owner
FROM (Transactions T NATURAL JOIN Requests R) INNER JOIN Pets P ON T.pet_id=P.petid
WHERE T.ct_id=$1 AND T.status='Confirmed'
ORDER BY s_date DESC
 */
var all_my_transaction_query = 'SELECT T.pet_id AS petid, R.s_date AS s_date , R.e_date AS e_date, T.cost AS cost, T.rate AS rate, T.review AS review, P.category AS category, T.status AS status\n' +
	'FROM (Transactions T NATURAL JOIN Requests R) INNER JOIN Pets P ON T.pet_id=P.petid\n' +
	'WHERE T.ct_id=$1 AND P.owner=$2\n' +
	'ORDER BY s_date DESC';
/*
SELECT T.pet_id AS petid, R.s_date AS s_date , R.e_date AS e_date, T.cost AS cost, T.rate AS rate, T.review AS review, P.category AS category, T.status AS status
FROM (Transactions T NATURAL JOIN Requests R) INNER JOIN Pets P ON T.pet_id=P.petid
WHERE T.ct_id=$1 AND P.owner=$2
ORDER BY s_date DESC
 */

/* Data */
var ct_id;
var ct;
var pcs;
var userid;
var transactions;
var table;

/* Err msg */

// GET
router.get('/:ct_id', function(req, res, next) {
	ct_id = req.params.ct_id;
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

router.get('/:ct_id/:userid', function(req, res, next) {
	ct_id = req.params.ct_id;
	userid = req.params.userid; // TODO: Use session ID
	pool.query(ct_info_query, [ct_id], (err, data) => {
		if (data.rows.length > 0) {
			ct = data.rows[0];
			pool.query(good_pc_query, [ct_id], (err, data) => {
				pcs = data.rows;
				pool.query(user_type_query, [userid], (err, data) => {
					var user_type = data.rows[0].value;
					if (user_type === 'none') {
						res.render('not_found_error', {component: 'user ID'});
					} else if (ct_id === userid) {
						// TODO: redirect to personal profile page
					} else if (user_type === 'both' || user_type === 'taker' || user_type === 'admin') {
						pool.query(all_transaction_query, [ct_id], (err, data) => {
							transactions = data.rows;
							table = 1;
							renderUserPage(res);
						})
					} else {
						pool.query(all_my_transaction_query, [ct_id, userid], (err, data) => {
							transactions = data.rows;
							table = 2;
							renderUserPage(res);
						})
					}
				})
			})
		} else {
			res.render('not_found_error', {component: 'care taker ID'});
		}
	})
})

module.exports = router;
