var express = require('express');
var router = express.Router();
require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/* SQL Query */
var admin_exist_query = 'SELECT 1 FROM PSCAdministrators WHERE userid=$1';
var all_salary = 'SELECT * FROM Salary';

/* Data */
var userid;
var isAdmin;

router.get("/summary_info",(req,res)=>{
      
    userid=req.params.userid; 

	pool.query(admin_exist_query, [userid], (err, data) => {
		isAdmin = data.rows.length > 0;
	});

    pool.query(all_salary, function (error, results, fields) {
        
        if (error) throw error;       
            
        if(isAdmin)
        {
        pool.query(all_transaction, function (error, results, fields) {
        
        res.render('summary_info',{
            res:results
        })
        if (error) throw error;
        
        }); 
		}
		else{
			res.render('error');
		}
      });   
})


module.exports = router;