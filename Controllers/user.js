import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongodb from 'mongodb';
const mongoClient=mongodb.MongoClient;
const URL="//localhost:27017"

/*Register user*/

export const Registeruser =async(req,res)=>{
    try {
        //connect db
        let client =await mongoClient.connect(URL);
        //select db
        let db=client.db("shop");
        //Hash password
        let salt=bcrypt.genSaltSync(10);
        let hash=bcrypt.hashSync(req.body.password,salt);

        req.body.password=hash;
        //post db
        let data=await db.collection("users").insertOne(req.body);
         //close db
        await client.close()
        res.sent(200).json({
            message:"user registered"
        })
    } catch (error) {
        console.log(error);
        res.json({
          message: "Registeration failed"
      })
    }

}

/*Login user*/

export const Login=async(req,res)=>{
try {
    let client =await mongoClient.connect(URL);
    let db= client.db("shop");
    let user=db.collection('users').findOne({email:req.body.email});
    if(user){
        let matchPassword=bcrypt.compareSync(req.body.password,user.password);
        if(matchPassword){
            let token=jwt.sign({id:user._id},process.env.JWT_SECRET);
            res.json({
                message:true,
                token
            })
        }else {
            res.status(404).json({
                message: "Username/Password is incorrect"
            })
        }
    }
    else{
        res.status(404).json({
            message: "Username/Password is incorrect"
        })
    }
} catch (error) {
    console.log(error);
    res.status(404).json({
        message: error
    })
}
}

