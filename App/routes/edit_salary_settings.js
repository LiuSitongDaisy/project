var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

var all_caretaker_query = 'SELECT userid FROM CareTakers';
var caretaker_exist_query = 'SELECT 1 FROM CareTakers WHERE userid=$1';
var salary;
var userid;

router.post('/edit_salary_settings', function (req, res, next) {
  var salary_policy = req.body.salary_policy;
  var salary = req.body.salary;
  console.log("salary_policy => " + salary_policy);
  console.log("salary => " + salary);
  res.redirect('/dashboard_Admin');
});

router.post('/edit_salary_settings', function (req, res, next) {
  var salary_policy = req.body.salary_policy;
  var salary = req.body.salary;
  pool.query(sql_query.query.salary, [userid, req.session.user.username], function (err, data) {
    if (err) {
      msg = "The username is invalid, please choose another user!";
      res.redirect('/edit_salary_settings?msg=' + msg);
    } else {
      res.redirect('/dashboard_Admin');
    }
  })
});

module.exports = router;