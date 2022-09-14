const express = require('express')
const router = express.Router()

const {v4} = require('uuid')


const multer = require('multer')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./images')
    },
    filename:function(req,file,cb){
        req.filename=v4();
        cb(null,req.filename+'.jpeg')
    }
})

const updateStorage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./images')
    },
    filename:function(req,file,cb){
        cb(null,req.filename)
    }
})


const upload = multer({storage:storage})
const update = multer({storage:updateStorage})

const {listFlightDeals,createFlightDeals,deleteFlightDeals,updateFlightDeals,images,updateImage,formSubmit} = require('../src/BestDeals/BestFlightDeals/Controller/FlightBestDeals')

router.get('/api/v1/bestDeals/Flight/:dealId',listFlightDeals)

router.post('/api/v1/bestDeals/Flight',upload.fields([{name:"thumbnail",maxCount:1},{name:"gallery",maxCount:20}]),createFlightDeals)

router.post('/api/v1/bestDeals/Flight/update/:dealId',updateFlightDeals)

router.delete('/api/v1/bestDeals/Flight/:dealId',deleteFlightDeals)

router.get('/api/v1/bestDeals/Flight/updateImage/:dealId/:filename',update.fields([{name:"thumbnail",maxCount:1},{name:"gallery",maxCount:1}]),updateImage)

router.get('/api/v1/bestDeals/image/:filename',images)

router.post('/api/v1/bestDeals/pasDetials',formSubmit)

router.param('dealId',(req,res,next,id)=>{
    req.dealId=id;
    next();
})

router.param('filename',(req,res,next,id)=>{
    req.filename=id;
    next();
})

module.exports=router;