import express  from "express";
import cors from "cors";
import router from "./Routes/Post.js";
import bodyParser from 'body-parser'
const PORT=process.env.PORT || 3001;
const app=express();



// const razorpay = new Razorpay({
// 	key_id: 'rzp_test_rFkV7RYeBZOzCE',
// 	key_secret: 'X4BxfMI96eCE5Y9XCwAXbfC2'
// })

// app.use(bodyParser.json())

app.use(
    cors({
      origin: "*",
    })
  );

app.use(express.json());



app.use("/",router);





app.listen(PORT,function(){
    console.log(`App is Listening ${PORT}`);
})

