import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongodb from "mongodb";
import dotenv from 'dotenv';


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
    let check = await db.collection("users").findOne({ email: req.body.email })
      
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
    }else{
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
    let user =await db.collection("users").findOne({ email: req.body.email });
    
    if (user) {
        
      let matchPassword = bcrypt.compareSync(req.body.password, user.password);
      
      if (matchPassword) {
        let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        console.log(user.Admin);
        res.json({
          message: true,
          token,
          unconditional:user.admin,
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
      message:"Internal server error",
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
