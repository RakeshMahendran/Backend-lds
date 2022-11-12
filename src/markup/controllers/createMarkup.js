const MarkUp = require('../model/markUp')


module.exports.createMarkup=async (req,res)=>{
    const newMarkup = new MarkUp()
    
    if(req.body.start_dateTime!=="")
    {
        newMarkup.start_dateTime=req.body.start_dateTime
    }

    if(req.body.end_dateTime!=="")
    {
        newMarkup.end_dateTime=req.body.end_dateTime
    }
    if(req.body.valid!=="")
    {
        newMarkup.valid=req.body.valid
    }
    if(req.body.origin!=="")
    {
        newMarkup.origin=req.body.origin
    }
    if(req.body.destination!=="")
    {
        newMarkup.destination=req.body.destination
    }
    if(req.body.api_id!=="")
    {
        newMarkup.api_id=req.body.api_id
    }
    if(req.body.airline!=="")
    {
        newMarkup.airline=req.body.airline
    }
    if(req.body.user_id!=="")
    {
        newMarkup.user_id=req.body.user_id
    }
    if(req.body.user_group_id!=="")
    {
        newMarkup.user_group_id=req.body.user_group_id
    }
    if(req.body.markup_type!=="")
    {
        newMarkup.markup_type=req.body.markup_type
    }
    if(req.body.markup_value!=="")
    {
        newMarkup.markup_value=req.body.markup_value
    }
    if(req.body.comission_type!=="")
    {
        newMarkup.comission_type=req.body.comission_type
    }
    if(req.body.comission_value!=="")
    {
        newMarkup.comission_value=req.body.comission_value
    }
    if(req.body.exclude_origin!=="")
    {
        newMarkup.exclude_origin=req.body.exclude_origin
    }
    
    console.log('[+] New markup ',newMarkup)

    newMarkup.save().then((data)=>{
        if(!data){
            return res.json({
                error:true,
                message:"Unable to create this markup"
            })
        }

        return res.json({
            error:false,
            message:"Successful entry of the new markup",
            date:data
        })
    })
}