import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongodb from "mongodb";
import dotenv from "dotenv";

const mongoClient = mongodb.MongoClient;
const URL = "mongodb://localhost:27017/shop";

dotenv.config();
/*Register user*/

export const Registeruser = async (req, res) => {
  req.body.admin = true;
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
      console.log("mail id already used");
      res.json({
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
  console.log("login");
  try {
    let client = await mongoClient.connect(URL);
    let db = client.db("shop");
    console.log(req.body.email);
    let user = await db.collection("users").findOne({ email: req.body.email });

    if (user) {
      let matchPassword = bcrypt.compareSync(req.body.password, user.password);

      if (matchPassword) {
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        console.log(user.Admin);
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

/*List all products*/

export const Getproducts = async (req, res) => {
  try {
    console.log(req.body);
    //conect the database
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select connect action and perform action
    let data = await db.collection("products").find().toArray();

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

/*Add to cart */

export const Addtocart = async (req, res) => {

  try {
    // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action
    let data = await db.collection("cart").find({$and:[{cartid: mongodb.ObjectId(req.body.values)},{userid:req.body.userid}]}).toArray();
     console.log(data.length);
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


/*Show profile*/

// export const showprofile = async (req, res) => {
//     try {
//       let client = await mongoClient.connect(URL);
//       let db = client.db("shop");
//       let user = await db.collection("users").findOne({ userid: req.body.userid });
//       res.status(404).json({
//        user
//       });
//     } catch (error) {
//       console.log(error);
//       res.status(404).json({
//         message: "Internal server error",
//       });
//     }
//   };


/*Add to  order*/

export const Addtoorder = async (req, res) => {

    try {
      // connect the database
      
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select the collection and perform the action
      let data = await db.collection("cart").find({userid:req.body.userid}).toArray();
    
      
      

     if(data.length>0){
        for await (const cart of data) {
            let putdata ={};
            putdata.userid=cart.userid;
            putdata.values=cart.values;
            putdata.cartid=cart.cartid;
            putdata.address="8/144 kanaku pillai kadu";
            putdata.status="Ordered";
            let order=await db.collection("order").insertOne(putdata);
        }
  
         
         
       
         await db.collection("cart").deleteMany({ userid:req.body.userid});
         
         await client.close();
  
  
  
        res.json({
          message: "Product Added",
        });
     }
      else{
        res.json({
            message: "something went wrong",
          });
          console.log("Without put data");
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