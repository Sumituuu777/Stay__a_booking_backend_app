const Home=require('../Models/home');
const User = require('../Models/user');
const path=require('path');
const rootdir = require('../util/path');
const user = require('../Models/user');


exports.homepage=(req,res,next)=>{ 
    Home.find().then((registeredHomes)=>{
        res.render('store/index',{homes : registeredHomes,title:'Airbnb',isLoggedIn: req.session.isLoggedIn,
            user:req.session.user
        })
}).catch(
    (err)=>{
        console.log("error while fetching homes",err);    
    }
)}

exports.availableHomes=(req,res,next)=>{
    Home.find().then((registeredHomes)=>{
        res.render('store/AvailableHomes',{homes : registeredHomes,title:'availableHomes',
            isLoggedIn: req.session.isLoggedIn,
            user:req.session.user
        })
}).catch(
    (err)=>{
        console.log("error while fetching homes",err);    
    }
)}


exports.getDetails=(req,res,next)=>{
    const homeId=req.params.homeId;
    Home.findById(homeId).then((home)=>{
        if(!home){
            console.log("home not found");
            return res.redirect('store/availablehomes');
        }
        res.render('store/home-details',{home:home,title:'Home details',isLoggedIn: req.session.isLoggedIn,
            user:req.session.user
        })
    }).catch((err)=>{
        console.log("ERROR occured in find my id",err);
    })
}


exports.getFavoritesList=(req,res,next)=>{
    const userId=req.session.user._id;
    User.findById(userId).populate('favoritesHomes')
     .then((user)=>{
        res.render('store/favorites-list',{
            favorites:user.favoritesHomes,
            title:'favorites',
            isLoggedIn: req.session.isLoggedIn,
            user:req.session.user
            }); 
     })  
}


exports.postFavorites=(req,res,next)=>{
    const homeId=req.body.homeId;
    const userId=req.session.user._id;
    
    User.findById(userId)
    .then(user=>{
        if(!user.favoritesHomes.includes(homeId)){
            user.favoritesHomes.push(homeId)
            return user.save();
        }
    })
    .then(()=>{
        res.redirect("/favorites");
    })
    .catch((err)=>{
        console.log("Error in add to favorites",err);
    }) 
}
exports.postremoveFavorite=(req,res,next)=>{
    const homeId=req.params.homeId;
    const userId=req.session.user._id;

    User.findById(userId)
    .then(user=>{
        user.favoritesHomes=user.favoritesHomes.filter(id=>id.toString()!==homeId)
        return user.save();
    })
    .then(()=>{
        res.redirect('/favorites')
    })
    .catch((err)=>{
        console.log("Error in remove from favorites",err);
    }) 
}
exports.getHouseRules=[(req,res,next)=>{
    if(!req.session.isLoggedIn){
        return res.redirect('/login')
    }
    next()
},
(req,res,next)=>{
    const homeId=req.params.homeId;
    const rulesFilename='Sumit_Resume_IIIT_Ranchi.pdf'
    const filepath=path.join(rootdir,'rules',rulesFilename)
    res.download(filepath,'Rules.pdf')
}]

//--------------  Booking function     ----------------------

exports.getBooked= async (req,res,next)=>{
    try{
        const homeId=req.params.homeId;
        const userId= req.session.user._id;

        await User.findById(userId).then(user=>{
            user.isBooked=true;
            return user.save();
        })
        .catch((err)=>{
            console.log("Error in remove from favorites",err);
        })
    }catch(err){
        console.log("Error in remove from favorites",err);
    }
}