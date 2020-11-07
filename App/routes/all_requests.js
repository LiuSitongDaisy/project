var express = require('express');
var router = express.Router();
var url = require('url');
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var all_petowner_query = 'SELECT 1 FROM PetOwners';
var petowner_exist_query = 'SELECT 1 FROM PetOwners WHERE userid=$1';
var requests_query = 'SELECT requests.pet_id, TO_CHAR(requests.s_date, \'YYYY-MM-DD\') AS s_date, TO_CHAR(requests.e_date, \'YYYY-MM-DD\') AS e_date, requests.transfer_type, requests.payment_type FROM requests, pets WHERE (requests.pet_id=pets.petid) AND pets.owner=$1';

/* Data */
var userid;

/* Err msg */


// GET
router.get('/:userid', function(req, res, next) {
	userid = req.params.userid; //TODO: May need to update with session user id
	pool.query(all_petowner_query, (err, data) => {
		if (err !== undefined) {
			res.render('connection_error');
		} else {
			pool.query(petowner_exist_query, [userid], (err, data) => {
				if (data.rows.length > 0) {
						pool.query(requests_query, [userid], (err, data) => {
							res.render('all_requests', {title: 'Requests', data: data.rows, userid : userid });
						});
				} else {
					res.render('not_found_error', {component: 'userid'});
				}
			});
		}
	});
});

// POST

module.exports = router;

	