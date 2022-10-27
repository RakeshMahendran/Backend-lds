const express = require("express")
const router = express.Router();

const {createMarkup} = require("../src/markup/controllers/createMarkup")
const {updateMarkup} = require('../src/markup/controllers/updateMarkUp')
const {readMarkup} = require("../src/markup/controllers/readMarkup")
const {deleteMarkup} = require("../src/markup/controllers/deleteMarkup")


router.post("/create",createMarkup)
router.get("/read",readMarkup)
router.put("/update/:markupId",updateMarkup)
router.delete('/delete/:markupId',deleteMarkup)

router.param("markupId",(req,res,next,id)=>{
    req.markupId = id;
    next();
})

module.exports=router