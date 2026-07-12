//core modules
const express=require('express');
//local modules
const { homepage, getDetails, availableHomes, postFavorites, getFavoritesList, postremoveFavorite, getHouseRules } = require('../controllers/storecontroller');

const storeRouter=express.Router();

storeRouter.get('/',homepage)
storeRouter.get('/availablehomes',availableHomes)
storeRouter.get('/favorites',getFavoritesList)
storeRouter.post('/favorites',postFavorites)
storeRouter.get('/home/:homeId',getDetails)
storeRouter.get("/remove-fav/:homeId",postremoveFavorite)
storeRouter.get("/rules/:homeId",getHouseRules)
storeRouter.get("/book/:homeId",)

exports.storeRouter=storeRouter;