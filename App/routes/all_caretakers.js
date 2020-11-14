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
		caretakers: caretakers,
		categories: categories
	})
}

/* SQL Query */
var all_ct_query = 'SELECT CT.userid AS userid, U.name AS name, U.gender AS gender, CT.rating AS rating,\n' +
	'  CASE WHEN CT.userid IN (SELECT userid FROM FullTimeCareTakers) THEN \'Full time\' ELSE \'Part time\' END AS category\n' +
	'FROM CareTakers CT NATURAL JOIN Users U\n' +
	'WHERE ($1=\'\' OR CT.userid IN (SELECT userid FROM FullTimeCareTakers))\n' +
	'AND ($2=\'all\' OR $2 IN (SELECT category FROM CanTakeCare WHERE ct_id=CT.userid))\n' +
	'ORDER BY COALESCE(rating, 0) DESC, category';
/*
SELECT CT.userid AS userid, U.name AS name, U.gender AS gender, CT.rating AS rating,
  CASE WHEN CT.userid IN (SELECT userid FROM FullTimeCareTakers) THEN 'Full time' ELSE 'Part time' END AS category
FROM CareTakers CT NATURAL JOIN Users U
WHERE ($1='' OR CT.userid IN (SELECT userid FROM FullTimeCareTakers))
AND ($2='all' OR $2 IN (SELECT category FROM CanTakeCare WHERE ct_id=CT.userid))
ORDER BY COALESCE(rating, 0) DESC, category
 */
var all_pc_query = 'SELECT * FROM PetCategories';

/* Data */
var caretakers;
var categories;
var type = '';
var category = 'all';

/* Err msg */

// GET
router.get('/', function(req, res, next) {
	pool.query(all_ct_query, [type, category], (err, data) => {
		caretakers = data.rows;
		pool.query(all_pc_query, (err, data) => {
			categories = data.rows;
			renderPage(res);
		})
	})
});

// POST
router.post('/', function(req, res, next) {
	type = req.body.type;
	category = req.body.category;
	res.redirect('/all_caretakers');
});

module.exports = router;
