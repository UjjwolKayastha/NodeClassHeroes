var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');


var session = require('express-session')
var fileStore = require('session-file-store')(session)

const User = require('./models/users')


const url = 'mongodb://localhost:27017/mydb';
const connect = mongoose.connect(url, {
    useNewUrlParser: true
});

connect.then((db) => {
    console.log("Connected to mongodb server");
}, (err) => {
    console.log(err);
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var heroesRouter = require('./routes/heroes');
var villainsRouter = require('./routes/villains');

var app = express();

//middleware
app.use(logger('dev'));
app.use(express.json()); // same as bodyParser.json()
app.use(express.urlencoded({
    extended: false
}));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        name: 'session-id',
        secret: 'secret-key',
        saveUninitialized: false,
        resave: false,
        store: new fileStore()
    })
)

app.use(cookieParser("my-sercret-key"));

function auth(req, res, next) {
    if (!req.session.user) {
        let authHeader = req.headers.authorization;
        if (!authHeader) {
            let err = new Error("You are not authenticated!");
            res.setHeader("WWW-Authenticate", "Basic");
            err.status = 401;
            return next(err);
        }
        let auth = new Buffer.from(authHeader.split(" ")[1], "base64").toString().split(":");
        User.findOne({
            username: auth[0]
        }).then(user => {
            if (user == null) {
                let err = new Error("User " + auth[0] + " does not exist!");
                res.setHeader("WWW-Authenticate", "Basic");
                err.status = 401;
                return next(err);
            } else if (user.password !== auth[1]) {
                let err = new Error("User password does not match!");
                res.setHeader("WWW-Authenticate", "Basic");
                err.status = 401;
                return next(err);
            }
            if (user.username === auth[0] && user.password === auth[1]) {
                req.session.user = "authenticated";
                next();
            } else {
                let err = new Error("You are not authenticated!");
                res.setHeader("WWW-Authenticate", "Basic");
                err.status = 401;
                next(err);
            }
        }).catch(err => next(err));
    } else {
        if (req.session.user === "authenticated") {
            next();
        } else {
            let err = new Error("You are not authenticated!");
            err.status = 401;
            return next(err);
        }
    }
}

//SESSION LAGAAYERA GAREKO + COOKIES NI CHHA

// function auth(req, res, next) {
//     if (!req.session.user) {
//         let authHeader = req.headers.authorization;
//         if (!authHeader) {
//             let err = new Error("You are not authenticated!");
//             res.setHeader("WWW-Authenticate", "Basic");
//             err.status = 401;
//             return next(err);
//         }
//         let auth = new Buffer.from(authHeader.split(" ")[1], "base64")
//             .toString()
//             .split(":");
//         if (auth[0] === "admin" && auth[1] === "secret") {
//             // res.cookie("user", "admin", { signed: true });      
//             req.session.user = "admin"
//             next(); // authorized    
//         } else {
//             let err = new Error("Username and password do not match!");
//             res.setHeader("WWW-Authenticate", "Basic");
//             err.status = 401;
//             return next(err);
//         }
//     } else {
//         if (req.session.user === "admin") {
//             console.log("req.session: ", req.session);
//             next();
//         } else {
//             let err = new Error("Your cookies do not match");
//             err.status = 401;
//             return next(err);
//         }
//     }
// }

// app.use(cookieParser("my-secret-key"));

// function auth(req, res, next){
//     console.log(req.headers);

//     if(req.signedCookies.user){

//         let authHeader = req.headers.authorization;
//         if (!authHeader) {
//             let err = new Error("You are not authenticated!");    
//             res.setHeader("WWW-Authenticate", "Basic");    
//             err.status = 401;
//             return next(err); 
//         }



//     let auth = new Buffer.from(authHeader.split(" ")[1], "base64")    
//     .toString()    
//     .split(":");
//     let username = auth[0];
//     let password = auth[1];
//     //   Default username and password
//     if(username == 'admin' && password== 'admin') {      
//         next(); // authorized  
//     } else {let err = newError('You are not authenticated!');      
//     res.setHeader('WWW-Authenticate', "Basic");      
//     err.status = 401;      
//     return next(err);  }
//     // console.log(req.headers);
//     // let authHeader = req.headers.authorization;
//     // if (!authHeader) {
//     //     let err = new Error("You are not authenticated!");    
//     //     res.setHeader("WWW-Authenticate", "Basic");    
//     //     err.status = 401;
//     //     return next(err); 
//     //  }

//     // let auth = new Buffer.from(authHeader.split(" ")[1], "base64").toString().split()
//     // let username = auth[0]
//     // let password = auth[1]

//     // if (username == 'admin' && password =='admin'){
//     //     next()
//     // }else{
//     //     let err = new Error("NOT AUTHORIZED")
//     //     res.setHeader("WWW-Authenticate", "Basic")
//     //     err.status = 401
//     //     return next(err)
//     // }
//     }

//     // else {
//     //     if (req.signedCookies.user === "admin") {      
//     //         next();    
//     //     } else {
//     //         let err = new Error("Your cookies do not match");      
//     //         err.status = 401;
//     //         return next(err);    }
//     // }

// }





app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(auth);

app.use('/heroes', heroesRouter);
app.use('/villains', villainsRouter);
module.exports = app;