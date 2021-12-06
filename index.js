import express  from "express";
import cors from "cors";
import router from "./Routes/Post.js";
import bodyParser from 'body-parser'
const PORT=process.env.PORT || 3001;
const app=express();





app.use(cors(
    {
        origin:"*",
    }
))

app.use(bodyParser.json())



app.use("/",router);





app.listen(PORT,function(){
    console.log(`App is Listening ${PORT}`);
})

