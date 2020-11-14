var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* Util */
var getString = (date) => date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
var compareDates = (d1, d2) => {
	if (d1.getFullYear() > d2.getFullYear()) {
		return 1;
	} else if (d1.getFullYear() < d2.getFullYear()) {
		return -1;
	} else if (d1.getMonth() > d2.getMonth()) {
		return 1;
	} else if (d1.getMonth() < d2.getMonth()) {
		return -1;
	} else if (d1.getDate() > d2.getDate()) {
		return 1;
	} else if (d1.getDate() < d2.getDate()) {
		return -1;
	} else {
		return 0;
	}
}
var isIn2Years = d => {
	var d1 = new Date();
	d1.setFullYear(d1.getFullYear() + 2);
	return compareDates(d, d1) <= 0;
}
var refreshPage = (res) => {
	res.render('edit_request', {
		title: 'Edit request',
		userid: userid,
		petid: petid,
		s_date: getString(s_date),
		e_date: getString(request.e_date),
		transfer_type: transfer_type,
		payment_method: payment_method,		
		request: request		
	})	
}

/* SQL Query */
var petowner_exist_query = 'SELECT 1 FROM PetOwners WHERE userid=$1';
var pet_exist_query = 'SELECT * FROM Pets WHERE petid=$1 AND owner=$2';
var request_exist_query = 'SELECT * FROM Requests WHERE pet_id=$1 AND s_date=$2';
var update_request_query = 'UPDATE Requests SET transfer_type=$1, payment_type=$2 WHERE pet_id=$3 AND s_date=$4';

/* Data */
var userid;
var petid;
var s_date;
var transfer_type;
var payment_method;
var request;

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
						pool.query(request_exist_query, [petid, getString(s_date)], (err, data) => {
							if (data.rows.length > 0) {
								request = data.rows[0];	
								transfer_type = request.transfer_type;
								payment_method = request.payment_type;	
								refreshPage(res);						
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
router.post('/:userid/:petid/:s_date', function(req, res, next) {
	userid = req.params.userid; //TODO: Need to replace with user session id
	petid = req.params.petid;
	s_date = new Date(req.params.s_date);
	e_date = new Date(req.params.e_date);
	transfer_type = req.body.transfer_type;
	payment_method = req.body.payment_method;	
	
	pool.query(update_request_query, [transfer_type, payment_method, petid, s_date], (err, data) => {
		if (err) {
			console.log(err);
		} else {
			console.log("Update request");
			res.redirect("/request/" + userid + "/" + petid + "/" + getString(s_date));
		}
	})
});

module.exports = router;
