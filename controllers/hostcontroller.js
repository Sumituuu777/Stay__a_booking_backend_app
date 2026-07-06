const Home=require('../Models/home')


exports.getHostHomes=(req,res,next)=>{
    const userId=req.session.user._id;

    Home.find({hostId:userId}).then((registeredHomes)=>{
        res.render('host/hosthomes',{homes : registeredHomes,title:'Host Homes',isLoggedIn: req.session.isLoggedIn,
            user:req.session.user
        })
}).catch(
    (err)=>{
        console.log("error while fetching homes",err);    
    }
)}


exports.getAddhome=(req,res,next)=>{
    const editing=req.query.editing==="true";
    res.render('host/edithome',{
        title:'Add Home',
        editing:editing,
        home:'',
        isLoggedIn: req.session.isLoggedIn,
        user:req.session.user
    });
};


exports.postAddhome=(req,res,next)=>{
    const{houseName,price,location,rating,description}=req.body;
    

// ye slash add karna bhaut important hai
// warna photo ka path hamesha tum jis page par ho waha ke aage se aaega,
// jaise localhost/host/uploads/photo  --- host homes me dekhoge toh,
// jaise localhost/home/uploads/photo  ---  home details me dekhoge toh,
// toh HOME PAGE par hi apni photo dekhingi , hosthomes ,home-details me nhi isliye "/" add karo.
    const photoURL="/"+req.file.path
    const newHome=new Home({
        houseName,
        price,
        location,
        rating,
        photoURL,
        description,
        hostId:req.session.user._id
    });
    newHome.save().then(()=>{
        res.redirect('/host/host-homes')
    }).catch((err)=>{
        console.log("ERROR in Post add home",err);  
    });   
};


exports.getEdithome=(req,res,next)=>{
    const editing=req.query.editing==="true";
    const homeId=req.params.homeId;
    Home.findById(homeId).then((home)=>{
        if(!home){
           return res.redirect("/availablehomes")
        }
        res.render('host/edithome',{
        title:"Edit Home",
        editing:editing,
        homeId:homeId,
        home:home,
        isLoggedIn: req.session.isLoggedIn,
        user:req.session.user
        })
        }).catch((err)=>{
        console.log("ERROR in Post add home",err);  
    })
};
exports.postEdithome=(req,res,next)=>{
    const {id,houseName,price,location,rating,description}=req.body;
    if(!req.file){
        return res.status(400).send("No Image uploaded")
    }
    const photoURL= "/"+ req.file.path;
    Home.findById(id).then(existingHome=>{
        if(!existingHome){
            console.log("home not found in post edit function for editing");
            res.redirect('/host/host-homes');
        }
        existingHome.houseName=houseName;
        existingHome.price=price;
        existingHome.location=location
        existingHome.rating=rating;
        if(req.file){
            existingHome.photoURL=req.file.path;
        }
        existingHome.description=description;
        return existingHome.save()
        })
        .then(()=>{
            res.redirect('/host/host-homes');
        })
        .catch((err)=>{
            console.log("error while updating home",err);
            
        })
}
exports.getDeletehome=(req,res,next)=>{
    const homeId=req.params.homeId;
    Home.findByIdAndDelete(homeId).then(()=>{
        return res.redirect("/host/host-homes")
    }).catch((err)=>{
        console.log("Error occured while deleting",err);     
    })
};
