//core modules
const http=require('http');
const path=require('path');
const express=require('express');
const bodyparser=require('body-parser');
const multer=require('multer');
require('dotenv').config();

const mongoose = require('mongoose');
const session=require('express-session')
const MongoDbStore=require('connect-mongodb-session')(session);


//local modules
const {hostRouter} = require('./router/hostRouter');
const {storeRouter} = require('./router/storeRouter');
const {authRouter} = require('./router/authRouter')
const rootdir = require('./util/path');

const app=express();

app.set('view engine','ejs');
app.set('views','views');


// url me halka sa change karna hai ast me '?appname=airbnb' ki jagah khali 'airbnb' likhna hai fir airbnb naam ka database ban jaaega 
const url=`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@airbnb.c30s2fi.mongodb.net/airbnb`

mongoose.connect(url)
.then(()=>{
    console.log("connected to mongodb");
    const server=http.createServer(app);
    server.listen(3053,()=>{
    console.log('server running at http://localhost:3053/');
    })
})
.catch((err)=>{
    console.log("error while connecting to mongodb",err)
})
const store=new MongoDbStore({
    uri:url,
    collection:'sessions'
})

//body parser used// lekin isko express.urlencoded({extended:true}) se  replace karna hai
app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
    secret:'airbnb secret',
    resave:false,
    saveUninitialized:false,
    store:store,
    cookie:{
        maxAge:1000 * 60 * 60 * 24 * 7,
        httpOnly:true,
        secure:false
    }
}))

app.use(express.static(path.join(rootdir,"public")))

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname )
    }
})
const fileFilter=(req,file,cb)=>{
    const value=['image/png','image/jpg','image/jpeg'].includes(file.mimetype);
    cb(null,value);
}

app.use(multer({storage, fileFilter}).single('photo'))
app.use('/uploads',express.static(path.join(rootdir,"uploads")))


//  local middleware starting

app.use(authRouter)


// res.locals is an object whose properties are automatically available inside the template being rendered (for example, an EJS view).
// Instead of doing
// res.render("shop", {
//     isLoggedIn: req.session.isLoggedIn
// });   for every route.  -----------

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    next();
});


app.use(storeRouter)
app.use("/host",hostRouter)


app.use((req,res,next)=>{
    res.statusCode=404;
    res.render('404',{title:'page not found',isLoggedIn: req.session.isLoggedIn});
})