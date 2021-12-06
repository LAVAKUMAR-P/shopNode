import express  from "express";
import cors from "cors";
import router from "./Routes/Post.js";
import shortid from 'shortid'
import Razorpay from 'razorpay'
import bodyParser from 'body-parser'
import crypto from 'crypto'
import * as fs from 'fs';
const PORT=process.env.PORT || 3001;
const app=express();



// const razorpay = new Razorpay({
// 	key_id: 'rzp_test_rFkV7RYeBZOzCE',
// 	key_secret: 'X4BxfMI96eCE5Y9XCwAXbfC2'
// })



app.use(cors(
    {
        origin:"*",
    }
))

app.use(bodyParser.json())



app.use("/",router);



// app.post('/razorpay', async (req, res) => {
// 	const payment_capture = 1
// 	const amount = 499
// 	const currency = 'INR'

// 	const options = {
// 		amount: amount * 100,
// 		currency,
// 		receipt: shortid.generate(),
// 		payment_capture 
// 	}

// 	try {
// 		const response = await razorpay.orders.create(options)
//         console.log("------Sentpayment to frount end-----------");
// 		console.log(response)
// 		res.json({
// 			id: response.id,
// 			currency: response.currency,
// 			amount: response.amount
// 		})
// 	} catch (error) {
// 		console.log(error)
// 	}
// })

app.listen(PORT,function(){
    console.log(`App is Listening ${PORT}`);
})

