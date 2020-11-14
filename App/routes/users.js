const express = require('express');
const passport = require('passport');
const router = express.Router();
const bcrypt = require('bcrypt');
//const initialize = require('./passport-config');
require('dotenv').config({path: __dirname + '/../.env'});
/*const expressEjsLayout = require('express-ejs-layouts');*/
const { Pool } = require('pg');
const { query } = require('express');
const pool = new Pool({connectionString:process.env.DATABASE_URL})

/*--- SQL query --- */
var users = 'SELECT * FROM Users WHERE userid = $5';
var passwords = 'SELECT password FROM AppUsers WHERE userid = $1'
var appusers = 'SELECT * FROM AppUsers';
var administrators = 'SELECT userid FROM PSCAdministrators WHERE userid = $2';
var caretakers = 'SELECT userid FROM CareTakers WHERE userid = $3';
var petowners = 'SELECT userid FROM PetOwners WHERE userid = $4';
var insert_into_users_query = 'INSERT INTO Users VALUES';
var insert_into_appusers_query = 'INSERT INTO AppUsers VALUES';
var insert_into_admin_query = 'INSERT INTO PSCAdministrators VALUES';
var insert_into_caretakers_query = 'INSERT INTO CareTakers VALUES';
var insert_into_petowners_query = 'INSERT INTO PetOwners VALUES';

//login handle
router.get('/login',(req,res)=>{
    res.render('login');
})
router.post('/login',(req, res, next)=>{
  var correct;
  pool.query(passwords, [userid], (errors, data) => {
    correct = data.rows.length > 0;
  })

  if(! correct) {
    errors.push({msg: "Please enter the correct password"})
  }

  if(correct) {
    var isAdmin;
    pool.query(administrators, [userid], (errors, data) => {
      isAdmin = data.rows.length > 0;
    })
    if(isAdmin) {
      passport.authenticate('local', {
        successRedirect : '/dashboarda',
        failureRedirect : '/login',
        faliureFlash : true,
      })(req, res, next);
    } else {
      var isCaretaker;
      pool.query(caretakers, [userid], (errors, data) => {
        isCaretaker = data.rows.length > 0;
      })
      if(isCaretaker) {
        passport.authenticate('local', {
        successRedirect : '/dashboardc',
        failureRedirect : '/login',
        faliureFlash : true,
      })(req, res, next);
      } else {
        passport.authenticate('local', {
        successRedirect : '/dashboardp',
        failureRedirect : '/login',
        faliureFlash : true,
      })(req, res, next);
      }
    }
  }
})

//Register handle
router.get('/register',(req,res)=>{
    res.render('register')
    })
router.post('/register',(req,res)=>{
  var gender;
  var temp = document.getElementsByClassName("gender");
  if(temp[0].checked) gender = MALE;
  if(temp[1].checked) gender = FEMALE;
  var identity;
  temp = document.getElementById("select");
  var index = temp.selectedIndex;
  identity = temp.options[index].value;

  const {userid, name, email, password, address} = req.body;
  let errors = [];
  console.log(' Name ' + userid+ ' email :' + email+ ' pass:' + password);
  if(!userid || !email || !password) {
      errors.push({msg : "Please fill in all fields"})
  }

  //check if password is more than 6 characters
  if(password.length < 6 ) {
      errors.push({msg : 'password atleast 6 characters'})
  }
  if(errors.length > 0 ) {
  res.render('register', {
      errors : errors,
      userid : userid,
      name: name,
      email : email,
      password : password,
      gender: gender,
      address: address,
      identity: identity
    })
  } else {
    //validation passed
    userid  = req.body.userid;
    name = req.body.name;
    email = req.body.email;
    password = req.body.password;
    gender = req.body.gender;
    address = req.body.address;
    identity = req.body.identity;

    var found_userid;
    pool.query(appusers, [userid], (errors, data) => {
      found_userid = data.rows.length > 0;
    });
    if (found_userid) {
      errors.push({msg : "The username already exists. Please choose another username."})
    } else if (userid === "") {
      errors.push({msg : "The username cannot be empty. Please provide a usename."})
    } else {
      pool.query(insert_into_users_query, [userid, name, gender, address], (errors, data) => {
        console.log("Inserted new user: { username: " + userid + ", name: " + name + ",gender: ", + gender + ", address: " + address + "}")
      })

      pool.query(insert_into_appusers_query, [userid, email, password], (errors, data) => {
        console.log("Inserted new appuser: { username:" + userid + ", email:" + email + ", password:" + password + "}" );
      });  
      
      if(identity = "administrator") {
        pool.query(insert_into_admin_query, [userid], (errors, data) => {
          console.log("Inserted new administrator: {username: " + userid + " }");
        })
      } else if(identity = "caretaker") {
        pool.query(insert_into_caretakers_query, [userid], (errors, data) => {
          console.log("Inserted new caretaker: username: " + userid + "}");
        })
      } else {
        pool.query(insert_into_petowners_query, [userid], (errors, data) => {
          console.log("Inserted new petowner: username: " + userid + "}");
        })
      }
      req.flash('success_msg','You have now registered!')
      res.redirect('./login'); 
    }
  }
})

//logout
router.get('/logout',(req,res)=>{
 })


/*var user;
pool.query(users, [userid], (errors, data) => {
  user = data;
}); 
router.get('/dashboarda', (req, res) => {
  res.render('/dashboarda', {
    userid: req.userid,
    name: user.name,
    email: user.email,
    gender: user.gender,
    address: user.address
  });
})

router.get('/dashboardc', (req, res) => {
  res.render('/dashboardc', {
    userid: req.userid,
    name: user.name,
    email: user.email,
    gender: user.gender,
    address: user.address
  });
})

router.get('/dashboardp', (req, res) => {
  res.render('/dashboardp', {
    userid: req.userid,
    name: user.name,
    email: user.email,
    gender: user.gender,
    address: user.address
  });
})*/



module.exports  = router;
