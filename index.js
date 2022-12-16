const express =require("express")
const bodyparser=require("body-parser")
const mongoose=require("mongoose")
const route=require("./src/routes/route.js")
let app=express()

app.use(bodyparser.json())

mongoose.connect( "mongodb+srv://subrat_400:4iQC1DP0ZqKInrD3@cluster0.h3xeivd.mongodb.net/user", {
    useNewUrlParser: true
})
// el6yacCucfWpP7l
    .then(() => { console.log("mongodb is connected") })
    .catch((err) => { console.log(err) })

app.use("/",route)

app.listen(process.env.PORT||3000,function (){
    console.log("express running on port",+(process.env.PORT||3000))
})