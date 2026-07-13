const Home=require('../Models/home');
const User = require('../Models/user');
const path=require('path');
const rootdir = require('../util/path');
const user = require('../Models/user');


exports.homepage=(req,res,next)=>{ 
    Home.find().then((registeredHomes)=>{
        registeredHomes.forEach(home=>{
            if(home.isBooked){
                if(home.bookingExpiry < Date.now()){
                    home.bookingExpiry=undefined;
                    home.isBooked=undefined;
                    home.bookerId=undefined;
                }
            }
        })
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

exports.getBooked= (req,res,next)=>{
    try{
        const homeId=req.params.homeId;
        const userId= req.session.user._id;
        const checkInDate = new Date();

        const checkOutDate = new Date(checkInDate);
        checkOutDate.setHours(checkOutDate.getHours() + 24);

        const checkIn = checkInDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        const checkOut = checkOutDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });

        Home.findById(homeId).then(home=>{
            home.isBooked=true;
            home.bookerId=userId;
            home.bookingExpiry=Date.now() + 24*60*60*1000;
            return home.save();
        })
        .then((home)=>{
            const totalPrice = home.price;
            res.render("store/bookingSuccess", {
            home,
            title:"Booked",
            checkIn,
            checkOut,
            totalPrice
        });
        })
        .catch((err)=>{
            console.log("Error in booking",err);
        })
    }catch(err){
        console.log("Error in booking",err);
    }
}

//--------------------------get Bookings func----------------------------

exports.getBooking=async(req,res,next)=>{
    try{
        const userId=req.params.userId;
        await Home.find().then(registeredHomes=>{
            const BookedHomes=registeredHomes.filter(home=>home.bookerId==userId);
            if(BookedHomes.length==0){
                return 
            }

            res.render("store/getBookings",{title:"your Bookings",BookedHomes,isLoggedIn: req.session.isLoggedIn,
            user:req.session.user})
        })
    }catch(err){
        console.log("Error in get booking",err);
    }
}