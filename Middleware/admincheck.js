import mongodb from 'mongodb';
const mongoClient=mongodb.MongoClient;
const URL="//localhost:27017";



 const admincheck = async (req,res,next)=>{
   
    req.body.userid = req.userid;
    try {
        // connect the database
    
        let client =await mongoClient.connect(URL);
        let db= client.db("shop");
        let value=db.collection('users').findOne({email:req.body.email});
        
        // console.log(check[0].admin);
    
        let value=check[0].admin
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