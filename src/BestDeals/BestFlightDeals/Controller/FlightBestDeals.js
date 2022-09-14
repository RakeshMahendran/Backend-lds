const fs = require('fs')


const BestFlightDeal= require('../Models/FlightBestDealsSchema')
const BestFlightPassenger = require('../Models/FlightBestDealsPassengerSchema')

exports.listFlightDeals=(req,res)=>{
    if(req.dealId==="all"){

        BestFlightDeal.find().exec((err,data)=>{
            data=data.map(e=>{
                e.thumbnail=`${process.env.IMAGE_URI}${e.thumbnail}`
                e.description=undefined;
                e.gallery=undefined;
                return e
            })
            res.json({
                error:false,
                data:data
            })
        })
    }
    else{
        BestFlightDeal.findOne({urlName:req.dealId}).exec((err,data)=>{
            if(err||!data){
                console.log('[+]Unable to find a deal...')
                return res.json({
                    error:false,
                    message:"unable to fins a deal..."
                })
            }
            data.thumbnail=undefined;
            data.gallery=data.gallery.map(e=>{
               
                    return `${process.env.IMAGE_URI}${e}`
            })
            return res.json({
                error:false,
                message:data
            })
        })
    }
}

exports.createFlightDeals=async (req,res)=>{
    console.log('[+]req.files',req.files.thumbnail)
    const newBestFlightDeal = new BestFlightDeal();

    const {title,description,from,to,price,currency,urlName}= req.body
    const{thumbnail,gallery}=req.files

    newBestFlightDeal.thumbnail=thumbnail[0].filename
    newBestFlightDeal.title=title
    newBestFlightDeal.description= description
    newBestFlightDeal.urlName=urlName
    flightData= newBestFlightDeal.flightData

    flightData.From= from
    flightData.To= to
    flightData.price=price
    flightData.currency= currency
    
    for(i of gallery){
        newBestFlightDeal.gallery.push(i.filename)
    }
    return res.json({data:(await newBestFlightDeal.save())})
}

exports.updateImage= (req,res)=>{
    console.log('[+]Updated image',req.files)
    if(req.files!=undefined){
       return res.json({
            error:false,
            message:"image updated succssfully"
        })
    }
    BestFlightDeal.findById(req.dealId).exec((err,data)=>{
        
        if(data.thumbnail===req.filename){
                console.log('[+] deleting thumnail',data.thumbnail,"  ",req.filename)
                fs.unlinkSync(`images/${req.filename}`)
                data.thumbnail=undefined
                data.save().then((err,data)=>{
                    return res.json({
                        error:false,
                        message:"Thumbnail deleted"
                    })
                })
            }
        else{
            fs.unlinkSync(`images/${req.filename}`)
            data.gallery=data.gallery.filter((e)=>e!=req.filename)
            data.save().then((err,data)=>{
                return res.json({
                    error:false,
                    message:"Thumbnail deleted"
                })
            })
        }

        
    })
   
}

exports.updateFlightDeals=async (req,res)=>{
    BestFlightDeal.findById(req.dealId).exec((err,data)=>{
        console.log('[+]Update data',data)
        if(req.body.title!=undefined){
            data.title=req.body.title
        }
        if(req.body.description!=undefined){
            data.description=req.body.description
        }
        if(req.body.from!=undefined){
            data.flightData.From=req.body.from
        }
        if(req.body.to!=undefined){
            data.flightData.To=req.body.to
        }
        console.log('[+]Updated flight data',data)
        data.save((err,data1)=>{
            if(err||!data1){
                return res.json({
                    error:true,
                    message:"Unable to update the data"
                })
            }
            return res.json({
                error:false,
                data:data1,
                message:"Update successfull"
            })
        })
    })

}

exports.images=(req,res)=>{
    // res.sendFile(`../images/${req.filename}`)
    res.sendFile(`${process.env.ROUTE}/images/${req.filename}`)
}


exports.deleteFlightDeals=async(req,res)=>{
    let data
    try{
        data = await BestFlightDeal.findById(req.dealId);

    }
    catch(err){
        return res.json({
            error:true,
            messaga:err
        })
    }
    console.log('[+] deleting data ',data)
    try{

        fs.unlinkSync(`images/${data.thumbnail}`)
    }
    catch(err){
        console.log('[+]Error on deleting ',err)
    }
    for(f of data.gallery){
        try{
            fs.unlinkSync(`images/${f}`)
        }
        catch(err){
            console.log('[+]Error on deleting ',err)
        }
    }
    try{
        await BestFlightDeal.deleteOne({_id:data._id})
        return res.json({
            error:false,
            messaga:"Deal deleted"
        })

    }
    catch(err){
        return res.json({
            error:true,
            messaga:err
        })
    }

}

exports.formSubmit=(req,res)=>{
    const newPassenger = new BestFlightPassenger(req.body)
    console.log('[+]New passenger ',newPassenger)
    newPassenger.save((err,data)=>{
        if(err||!data){
            return res.json({
                error:true,
                message:"Unable to save it in database"
            })
        }
        return res.json({
            error:false,
            message:data
        })
    })
}