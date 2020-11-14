var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

var exist_caretaker_query = 'SELECT userid FROM CareTakers WHERE userid=$1';
var admin_exist_query = 'SELECT 1 FROM PSCAdministrators WHERE userid=$1';

var insert_query = 'INSERT INTO Salary VALUES'

 var userid;

router.post('/edit_salary_settings', function (req, res, next) {
  var caretakerid = req.body.caretakerid;
  var salary_policy = req.body.salary_policy;
  var salary = req.body.salary;
  userid = req.params.userid;

  pool.query(admin_exist_query, [userid], (err, data) => {
		isAdmin = data.rows.length > 0;
	});

  console.log("salary_policy => " + salary_policy);
  console.log("salary => " + salary);

  pool.query(exist_caretaker_query,[caretakerid], function (err, data) {
    if (err) {
      msg = "The username is invalid, please choose another user!";
      res.redirect('/edit_salary_settings?msg=' + msg);
    } else { 
      //delete
      pool.query('DELETE FROM salary WHERE userid=',[caretakerid],(err,data) => {
        console.log("delete successfully: " + caretakerid);
      });
      //insert new salaryrecord
      pool.query(insert_query, (err,data) => {
        console.log("Inserted new salary: " + salary);
      });
      res.redirect('/dashboard_Admin');
    }
   
  })
});

module.exports = router;