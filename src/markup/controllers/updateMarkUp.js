const MarkUp = require("../model/markUp")


exports.updateMarkup=async (req,res)=>{
    const markup = await MarkUp.findById(req.markupId)

    
    if(req.body.start_dateTime!=="")
    {
        markup.start_dateTime=req.body.start_dateTime
    }
    if(req.body.end_dateTime!=="")
    {
        markup.end_dateTime=req.body.end_dateTime
    }
    if(req.body.valid!=="")
    {
        markup.valid=req.body.valid
    }
    if(req.body.origin!=="")
    {
        markup.origin=req.body.origin
    }
    if(req.body.destination!=="")
    {
        markup.destination=req.body.destination
    }
    if(req.body.api_id!=="")
    {
        markup.api_id=req.body.api_id
    }
    if(req.body.airline!=="")
    {
        markup.airline=req.body.airline
    }
    if(req.body.user_id!=="")
    {
        markup.user_id=req.body.user_id
    }
    if(req.body.user_group_id!=="")
    {
        markup.user_group_id=req.body.user_group_id
    }
    if(req.body.markup_type!=="")
    {
        markup.markup_type=req.body.markup_type
    }
    if(req.body.markup_value!=="")
    {
        markup.markup_value=req.body.markup_value
    }
    if(req.body.comission_type!=="")
    {
        markup.comission_type=req.body.comission_type
    }
    if(req.body.comission_value!=="")
    {
        markup.comission_value=req.body.comission_value
    }
    if(req.body.exclude_origin!=="")
    {
        markup.exclude_origin=req.body.exclude_origin
    }

    markup.save().then((data)=>{
        if(!data){
            return res.json({
                error:true,
                message:"unable to update this markup"
            })
        }

        return res.json({
            error:false,
            message:"Successfull update",
            data:data
        })
    })

   
}