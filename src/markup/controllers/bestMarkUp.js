const MarkUp = require("../model/markUp")

exports.bestMarkUp = async (origin="",destination="",airline="",user_group_id="111111111111aaaaaaaaaaaa",user_id="111111111111aaaaaaaaaaaa")=>{
    var current = new Date();
    
    // console.log('[+]',current)
    const data = await MarkUp.find({$and:[{$or:[{origin:origin},{destination:destination},{airline:airline},{user_group_id:user_group_id},{user_id:user_id}]},{$and:[{start_dateTime:{$lte:current}},{end_dateTime:{$gte:current}}]}]})
    // console.log('FOUND')
    // console.log('[+]Quered data ',data)

    if(!data){
        return undefined
    }

    let maxCount={
        count:0,
        index:0,
        match:[]
    }

    data.map((e,i)=>{
        
        let count =0;
        let match=[]
        if(origin===e.origin||e.origin===null){
            count++
            match.push(e.origin)
        }
        if(destination===e.destination||e.destination===null){
            count++
            match.push(e.destination)
        }
        if(airline===e.airline||e.airline===null){
            count++
            match.push(e.airline)
        }
        if(user_group_id===e.user_group_id||e.user_group_id===null){
            count++
            match.push(e.user_group_id)
        }
        if(user_id===e.user_id||e.user_id===null){
            count++
            match.push(e.user_id)
        }
        if(count>maxCount.count){
            maxCount.count=count
            maxCount.index=i
            maxCount.match=match
        }
    })
    // console.log('[+]The maximum match data ',maxCount)
    // console.log('[+]The markup ',data[maxCount.index])
    return data[maxCount.index]
}
   


// airline api user origin dest 