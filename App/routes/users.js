const express = require('express');
const router = express.Router();

require('dotenv').config({path: __dirname + '/../.env'});

const { Pool } = require('pg')
const pool = new Pool({connectionString:process.env.DATABASE_URL})

// retrive data from database
var appusers = 'SELECT * FROM AppUsers';
var administrators = 'SELECT userid FROM PSCAdministrators';
var caretakers = 'SELECT userid FROM CareTakers';
var petowners = 'SELECT userid FROM PetOwners';

//login handle
router.get('/login',(req,res)=>{
    res.render('login');
})
router.post('/login',(req,res,next)=>{
  })

//Register handle
router.get('/register',(req,res)=>{
    res.render('register')
    })
router.post('/register',(req,res)=>{
  const {name, email, password} = req.body;
  let errors = [];
  console.log(' Name ' + name+ ' email :' + email+ ' pass:' + password);
  if(!name || !email || !password) {
      errors.push({msg : "Please fill in all fields"})
  }

  //check if password is more than 6 characters
  if(password.length < 6 ) {
      errors.push({msg : 'password atleast 6 characters'})
  }
  if(errors.length > 0 ) {
  res.render('register', {
      errors : errors,
      name : name,
      email : email,
      password : password})
  } else {
    //validation passed
    var username  = req.body.username;
    //var email    = req.body.email;
    var pwd = req.body.password;
  }
      
    /*User.findOne({email : email}).exec((err,user)=>{
      console.log(user);   
      if(user) {
          errors.push({msg: 'email already registered'});
          render(res,errors,name,email,password,password2);
          
        } else {
          const newUser = new User({
              name : name,
              email : email,
              password : password
          });*/
})

//logout
router.get('/logout',(req,res)=>{
 })

module.exports  = router;
