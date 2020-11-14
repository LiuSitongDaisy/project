const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index')
})

//login page
router.get('/login', (req,res)=>{
    res.render('login');
})

//Register page
router.get('/register', (req,res)=>{
    res.render('register')
    })
    

module.exports  = router;