import mongodb from 'mongodb';
const mongoClient=mongodb.MongoClient;
const URL="mongodb://localhost:27017/shop";

export const Registerproduct=async(req,res)=>{
     try {
         // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action
    req.body.userid = req.userid;

    let data = await db.collection("products").insertOne(req.body);

    //close the connection
    await client.close();

    res.json({
      message: "Product not created",
    });
     } catch (error) {
         console.log(error);
         res.status(404).json({
            message: "something went wrong"
        })
     }
}

export const Editproduct=async(req,res)=>{
  try {
      // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action
    let data = await db.collection("products").findOneAndUpdate({_id: mongodb.ObjectId(req.params.id)},{$set:req.body})

    //close the connection
    await client.close();

    res.json({
      message: "product updated",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
       message: "something went wrong"
   })
  }
}

export const Deleteproduct=async(req,res)=>{
    try {
         // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action
    let data = await db.collection("product").findOneAndDelete({_id: mongodb.ObjectId(req.params.id)})

    //close the connection
    await client.close();

    res.json({
      message: "product Deleted",
    });

    } catch (error) {
        console.log(error);
        res.status(404).json({
           message: "something went wrong"
       })  
    }
}


