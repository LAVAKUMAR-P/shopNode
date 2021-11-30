import mongodb from 'mongodb';
const mongoClient=mongodb.MongoClient;
const URL="mongodb://localhost:27017/shop";



 const admincheck = async (req,res,next)=>{
  
    try {
        // connect the database
         console.log(req.body.userid);
        let client =await mongoClient.connect(URL);
        let db= client.db("shop");
        
        let check=await db.collection('users').findOne({_id: mongodb.ObjectId(req.body.userid)});
        
       console.log(check);
    
        let value=check.admin
        if(value){
            
         await client.close();
            next();
        } else {
        await client.close();
     
        res.status(401).json({ message: "You are not allowed to see this data"})
        }
      } catch (error) {
        console.log(error);
        res.status(401).json({
          message: "You are not allowed to see this data"
      })
      }
}

export default admincheck