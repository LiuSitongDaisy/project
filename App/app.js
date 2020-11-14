const express = require('express');
const router = express.Router();
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport');
//require("./routes/passport-config")(passport)
const session = require('express-session');
const flash = require('connect-flash');

//const expressEjsLayout = require('express-ejs-layouts');


var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var summaryinfoRouter = require('./routes/summary_info');
app.use('/summary_info',summaryinfoRouter);


var indexRouter = require('./routes/index');

/* --- V3: Basic Template   --- */
var tableRouter = require('./routes/table');
var loopsRouter = require('./routes/loops');
/* ---------------------------- */

/* --- V4: Database Connect --- */
var selectRouter = require('./routes/select');
/* ---------------------------- */

/* --- Open access ------------ */
var allCaretakersRouter = require('./routes/all_caretakers')
var viewCaretakerRouter = require('./routes/view_caretaker')

/* --- Pet Owner -------------- */
var newPetRouter = require('./routes/new_pet');


/*---CareTaker------------------*/
var salaryRouter = require('./routes/salary');

/*---Admin----------------------*/
var editsalarysettingsRouter = require('./routes/edit_salary_settings');
var summaryinfoRouter = require('./routes/summary_info');

var app = express();

var newRequestRouter = require('./routes/new_request');
var newTransactionRouter = require('./routes/handle_transactions');
var requestRouter = require('./routes/request');
var allRequestsRouter = require('./routes/all_requests');
var editRequestRouter = require('./routes/edit_request');
var deleteRequestRouter = require('./routes/delete_request');
var servicesRouter = require('./routes/services');

/* --- Log in, Register, Edit profile, User profiles */
var usersRouter = require('./routes/users');
var indexRouter = require('./routes/index');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(expressEjsLayout);

// BodyParser
app.use(express.urlencoded({extended: false}));
//express session
app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
 }));
app.use(passport.initialize());
app.use(passport.session());
 //use flash
 app.use(flash());
 app.use((req,res,next)=> {
   res.locals.success_msg = req.flash('success_msg');
   res.locals.error_msg = req.flash('error_msg');
   res.locals.error  = req.flash('error');
 next();
 })

app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/* --- Routes --- */
app.use('/', indexRouter);


/* --- V3: Basic Template   --- */
app.use('/table', tableRouter);
app.use('/loops', loopsRouter);
/* ---------------------------- */

/* --- V4: Database Connect --- */
app.use('/select', selectRouter);
/* ---------------------------- */

/* --- Open access ------------ */
app.use('/all_caretakers', allCaretakersRouter);
app.use('/view_caretaker', viewCaretakerRouter);

/* --- Pet Owner -------------- */
app.use('/new_pet', newPetRouter);
app.use('/new_request', newRequestRouter);
app.use('/handle_transactions', newTransactionRouter);
app.use('/request', requestRouter);
app.use('/all_requests', allRequestsRouter);
app.use('/edit_request', editRequestRouter);
app.use('/delete_request', deleteRequestRouter);
app.use('/services', servicesRouter);

/* --- Log in, Register, Edit profiles, and User profiles */
app.use('/login', usersRouter);
app.use('/register', usersRouter);
app.use('/edit_profile', usersRouter);
app.use('/dashboarda', usersRouter);
app.use('/dashboardc', usersRouter);
app.use('/dashboardp', usersRouter);
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})



/*---Care Taker-----------------*/
app.use('/salary',salaryRouter);

/*---Admin----------------------*/
app.use('/edit_salary',editsalarysettingsRouter);
app.use('/summary_info',summaryinfoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;