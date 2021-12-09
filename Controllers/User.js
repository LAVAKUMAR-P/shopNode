import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongodb from "mongodb";
import dotenv from "dotenv";
import crypto from 'crypto'
import * as fs from 'fs';
import shortid from 'shortid'
import Razorpay from 'razorpay';
import sendEmail from "../Utils/Email.js";
import {OAuth2Client} from "google-auth-library"

dotenv.config();
const Googleclient = new OAuth2Client(process.env.REACT_APP_GOOGLE_CLIENT_ID);

const razorpay = new Razorpay({
	key_id:process.env.key_id,
	key_secret:process.env.key_secret,
})

const mongoClient = mongodb.MongoClient;
const URL =process.env.CONNECTION_URL ;


/*Register user*/

export const Registeruser = async (req, res) => {
  req.body.admin = false;
  try {
    //connect db
    let client = await mongoClient.connect(URL);
    //select db
    let db = client.db("shop");
    let check = await db.collection("users").findOne({ email: req.body.email });

    if (!check) {
      //Hash password
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(req.body.password, salt);

      req.body.password = hash;
      //post db
      let data = await db.collection("users").insertOne(req.body);
      //close db
      await client.close();
      res.json({
        message: "user registered",
      });
    } else {
      // console.log("mail id already used");
      res.status(404).json({
        message: "Email already Registered",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      message: "Registeration failed",
    });
  }
};

/*Login user*/

export const Login = async (req, res) => {
  // console.log("login");
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("shop");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: req.body.email });

    if (user) {
      let matchPassword = bcrypt.compareSync(req.body.password, user.password);

      if (matchPassword) {
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        // console.log(user.Admin);
        res.json({
          message: true,
          token,
          unconditional: user.admin,
        });
      } else {
        res.status(404).json({
          message: "Username/Password is incorrect",
        });
      }
    } else {
      res.status(404).json({
        message: "Username/Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
  }
};

/*Google Register user*/

export const GoogleRegister = async (req, res) => {
  // console.log("login");
  try {
    const { token } = req.body;
  const ticket = await Googleclient.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });
  // console.log("--------------------------------------");
  // console.log(ticket);
  // console.log("---------------------------------------");
  const { given_name,family_name, email, picture,email_verified } = ticket.getPayload();
  if(email_verified){
//connect db
let client = await mongoClient.connect(URL);
//select db
let db = client.db("shop");
let check = await db.collection("users").findOne({ email: email });

if (!check) {
  //post db
  let data = await db.collection("users").insertOne({firstName:given_name,lastName:family_name,email,picture,admin:false});
  //close db
  await client.close();
  res.json({
    message: "user registered",
  });
} else {
  // console.log("mail id already used");
  res.status(409).json({
    message: "Email already Registered",
  });
}
  }
  else{
    res.status(404).json({
      message: "Something went wrong",
    });
  }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
  }
};


/*Google Login */

export const GoogleLogin=async(req,res)=>{
  try {
    const { token } = req.body;
    const ticket = await Googleclient.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });
    // console.log("--------------------------------------");
    // console.log(ticket);
    // console.log("---------------------------------------");
    const { email,email_verified } = ticket.getPayload();
    
    if(email_verified){
      let client = await mongoClient.connect(URL);
    let db = client.db("shop");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: email });

    let jwttoken = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // console.log(user.Admin);
    res.json({
      message: true,
      token:jwttoken,
      unconditional: user.admin,
    });
    }else{
      res.status(404).json({
        message: "Username/Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
  }
}

/*Forget password */

export const Forgetpassword = async (req, res) => {
 
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("shop");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: req.body.email });
      if (!user)
          return res.status(400).send("user with given email doesn't exist");
         
            let token = await db.collection("token").find({ email: req.body.email }).toArray();
          
      if (token.length===0) {
        // console.log("if runned");
        let index=await db.collection("token").createIndex( { "createdAt": 1 }, { expireAfterSeconds: 300 } )
        let token = await db.collection("token").insertOne({
        "createdAt": new Date(),
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
        email: req.body.email
        });
        token = await db.collection("token").find({ email: req.body.email }).toArray();
        // console.log(token);
        const link = `${process.env.BASE_URL}/resetpassword/${user._id}/${token[0].token}`;
        await sendEmail(user.email, "Password reset",`your rest password link : ${link}` );
      //  console.log(link);
       await client.close();
      res.status(200).send("password reset link sent to your email account"); 
      }
     else{
      res.status(404).json({
        message: "Internal server error",
      });
      await client.close();
     }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
    await client.close();
  }
};

/*Reset password */
export const Resetpassword = async (req, res) => {
 
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("shop");
    // console.log(req.body.email);
    let user = await db.collection("users").findOne({_id:mongodb.ObjectId(req.params.userId)});
      if (!user)
          return res.status(400).send("invalid link or expired");
         
            let token = await db.collection("token").find({   userId: user._id,
              token: req.params.token,
            }).toArray();
            // console.log(token);
          
      if (token.length===1) {

        let salt = bcrypt.genSaltSync(10);
       let hash = bcrypt.hashSync(req.body.password, salt);
       req.body.password = hash;
       let data = await db.collection("users").findOneAndUpdate({_id:mongodb.ObjectId(req.params.userId)},{$set:{password:req.body.password}})
        let Delete=await db.collection("token").findOneAndDelete({   userId: user._id,
          token: req.params.token,
        })

        await client.close();
        return res.status(200).send("Reset sucessfull");
      }
     else if(token.length===0){
      await client.close();
      return res.status(406).send("Invalid link or expired");
     }
     else{
      res.status(404).json({
        message: "Internal server error",
      });
      await client.close();
     }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Internal server error",
    });
    await client.close();
  }
};
/*GET USER DETAILS*/

export const Getuser = async (req, res) => {
 
  try {
    
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select connect action and perform action
    let data = await db.collection("users").findOne({_id:mongodb.ObjectId(req.body.userid)});

    //close the connection
    client.close();

    res.status(200).json(data.address);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Edit product */


export const Editaddress = async (req, res) => {
 
  try {
    
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select connect action and perform action
    let data = await db.collection("users").findOneAndUpdate({_id:mongodb.ObjectId(req.body.userid)},{$set:{address:req.body.address}});

    //close the connection
    client.close();

    res.status(200).json(data.address);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};


/*List all products*/


export const Getproducts = async (req, res) => {
  try {
    
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select connect action and perform action
    let data = await db.collection("products").find().toArray();

    //close the connection
    client.close();

    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Add to cart */

export const Addtocart = async (req, res) => {

  try {
    // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action
    let data = await db.collection("cart").find({$and:[{cartid: mongodb.ObjectId(req.body.values)},{userid:req.body.userid}]}).toArray();
    
   if(data.length===0){
    let product = await db.collection("products").findOne({ _id: mongodb.ObjectId(req.body.values) });
    //    console.log(product);
    req.body.values = product.values;
    req.body.cartid = product._id;
  
    let putdata = await db.collection("cart").insertOne(req.body);
   

    res.json({
      message: "Product Added",
    });
     
     //close the connection
     await client.close();
   }else{

    res.status(405).json({
        message: "Product Can only remove or increase from cart",
      });

      await client.close();
   }

  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "something went wrong",
    });
  }
};

/*Get all items in cart*/

export const Getcartproducts = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select connect action and perform action
    let data = await db
      .collection("cart")
      .find({ userid: req.body.userid })
      .toArray();

    //close the connection
    client.close();

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};

/*Icrement in cart */

export const Incrementcart = async (req, res) => {
  try {
    // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action

    let product = await db
      .collection("cart")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });
    product.values["count"] = product.values["count"] + 1;

    let data = await db
      .collection("cart")
      .findOneAndUpdate(
        { _id: mongodb.ObjectId(req.params.id) },
        { $set: product }
      );

    //close the connection
    await client.close();

    res.json({
      message: "Product increased",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "something went wrong",
    });
  }
};

/*Decrement in cart */

export const Decrementcart = async (req, res) => {
  try {
    // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action

    let product = await db
      .collection("cart")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    if (product.values["count"] > 1) {
      product.values["count"] = product.values["count"] - 1;
    } else {
      product.values["count"] = product.values["count"];
    }
    let data = await db
      .collection("cart")
      .findOneAndUpdate(
        { _id: mongodb.ObjectId(req.params.id) },
        { $set: product }
      );

    //close the connection
    await client.close();

    res.json({
      message: "Product increased",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "something went wrong",
    });
  }
};

/*Remove cart product*/

export const Removecartproduct = async (req, res) => {
  try {
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select connect action and perform action
    let data = await db
      .collection("cart")
      .findOneAndDelete({ _id: mongodb.ObjectId(req.params.id) });

    //close the connection
    client.close();

    res.json({
      message: "sucess",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "something went wrong",
    });
  }
};



/*payment verification */

export const Verification =async (req, res) => {
	// do a validation
    res.json({ status: 'ok' })
    console.log("------Recived from rezopay -----------");

	try {
        const secret = process.env.secret
	 

    let paymentid=req.body.payload.payment.entity.id;
    let orderid=req.body.payload.payment.entity.order_id;
    let used=false;

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	// console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		// console.log('request is legit')
		// // process it
		//       fs.writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))

   //connect db
   let client = await mongoClient.connect(URL);
   //select db
   let db = client.db("shop");

   let data = await db.collection("payment").insertOne({paymentid,orderid,used});
   //disconnect db

   await client.close();
       
	} else {
		// pass it
	}
	
    } catch (error) {
        console.log(error);
        res.json({ status: 'ok' })
    }
}

/*payment recipt */

export const Razorpaypm =async (req, res) => {
  // console.log(req.body);
	const payment_capture = 1
	const currency = 'INR'
	try {
      // connect the database
      
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select the collection and perform the action
      let data = await db.collection("cart").find({userid:req.body.userid}).toArray();
      let amount=0

      if(data.length>0){
        for await (const cart of data) {
            let price =(cart.values.price*cart.values.count)
            amount=amount+price
        }
     
        const options = {
          amount: amount * 100,
          currency,
          receipt: shortid.generate(),
          payment_capture 
        }
  
      const response = await razorpay.orders.create(options)
      //     console.log("------Sentpayment to frount end-----------");
      console.log(response)
      res.json({
        id: response.id,
        currency: response.currency,
        amount: response.amount
      })

      await client.close();
      } else{
        res.json({
            message: "something went wrong",
          });
          // console.log("Without put data");
          await client.close();
      }


      
	} catch (error) {
		console.log(error)
	}
}


/*Add to  order*/

export const Addtoorder = async (req, res) => {

    try {
      // connect the database
      
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select the collection and perform the action
      let data = await db.collection("cart").find({userid:req.body.userid}).toArray();
    
      //find user from datbase

      let user = await db.collection("users").findOne({_id:mongodb.ObjectId(req.body.userid)});

      //payment confirm

      let ok = await db.collection("payment").findOne({paymentid:req.body.paymentid});
      console.log(ok);
      let count=0
    if(ok !== null){
      if((data.length>0) && (!ok.used)){
        for await (const cart of data) {
            let putdata ={};
            putdata.userid=cart.userid;
            putdata.values=cart.values;
            putdata.cartid=cart.cartid;
            putdata.address=user.address;
            putdata.status="Ordered";
            let order=await db.collection("order").insertOne(putdata);
        }
  
         
         await db.collection("cart").deleteMany({ userid:req.body.userid});

         ok.used=true;
        

        let update= await db.collection("payment").findOneAndUpdate({ _id: mongodb.ObjectId(ok._id) },{$set:{used: true,userid:req.body.userid}})
         console.log("payment updated");
         
         await client.close();
  
  
  
        res.json({
          message: "Product Added",
        });
     }
      else{
        res.json({
            message: "something went wrong",
          });
          // console.log("Without put data");
          await client.close();
      }
    }else{
      res.json({
        message: "Internal process error kindly contact us",
      });
      // console.log("Without put data");
      await client.close();

    }   
    } catch (error) {
      console.log(error);
      res.status(404).json({
        message: "something went wrong",
      });
    }
  };


  /*view  order*/
  export const Getorderproducts = async (req, res) => {
    try {
      //conect the database
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select connect action and perform action
      let data = await db
        .collection("order")
        .find({ userid: req.body.userid })
        .toArray();
  
      //close the connection
      client.close();
  
      res.json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "something went wrong",
      });
    }
  };

  /*Get search product*/

  export const Getsearchproducts = async (req, res) => {
    try {
      //conect the database
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select connect action and perform action
      let result = await db
        .collection("products")
        .find()
        .toArray();
      let data=[]
        if(result.length>0){
          for await (const cart of result) {
            let value=cart.values["title"]
            if(value.toLowerCase().includes(req.params.search.toLowerCase())){
              // console.log(cart);
              data.push(cart)
            }
              
          }

        }

      // console.log(data);
      //close the connection
      client.close();
  
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "something went wrong",
      });
    }
  };
