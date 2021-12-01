import mongodb from 'mongodb';
const mongoClient=mongodb.MongoClient;
const URL="mongodb://localhost:27017/shop";




export const Getproductsbyadmin = async (req, res) => {
  try {
    
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

export const Registerproduct=async(req,res)=>{
     try {
         // connect the database

    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");

    //select the collection and perform the action
    

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
    console.log(req.body);
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
         console.log(req.params.id,"by deldete");
    let client = await mongoClient.connect(URL);

    //select the db
    let db = client.db("shop");
    console.log(req.params.id +"delete product");
    //select the collection and perform the action
    let data = await db.collection("products").findOneAndDelete({_id: mongodb.ObjectId(req.params.id)})
   console.log("Deleted");
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


export const Getproductsbyid = async (req, res) => {
    
    try {
      console.log(req.body);
      //conect the database
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select connect action and perform action
      let data = await db.collection("products").findOne({_id: mongodb.ObjectId(req.params.id)});
  
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

  /*GET all orders*/
  export const GetorderByadmin = async (req, res) => {
    try {
      //conect the database
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select connect action and perform action
      let data = await db
        .collection("order")
        .find()
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

/*GET orders by id */
export const GetorderByadminid = async (req, res) => {
    try {
      //conect the database
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select connect action and perform action
      let data = await db
        .collection("order")
        .findOne({_id: mongodb.ObjectId(req.params.id)})
  
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


  /*Update orders*/
  export const Editorder=async(req,res)=>{
    try {
        // connect the database
  
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
      console.log("-----------------------------------------------------------------------");
      console.log(req.body);

      let data = await db
        .collection("order")
        .findOne({_id: mongodb.ObjectId(req.params.id)})
        data.status=req.body.status
      //select the collection and perform the action
      console.log(data);
      let post = await db.collection("order").findOneAndUpdate({_id: mongodb.ObjectId(req.params.id)},{$set: data})
      
      //close the connection
      await client.close();
  
      res.json({
        message: "order updated",
      });
    } catch (error) {
      console.log(error);
      res.status(404).json({
         message: "something went wrong"
     })
    }
  }


  /*ALL users */
  export const Allusersbyadmin = async (req, res) => {
    try {
      //conect the database
      let client = await mongoClient.connect(URL);
  
      //select the db
      let db = client.db("shop");
  
      //select connect action and perform action
      let data = await db
        .collection("users")
        .find()
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


/*Make admin */
  export const makeadmin=async(req,res)=>{
    try {
        // connect the database

   let client = await mongoClient.connect(URL);

   //select the db
   let db = client.db("shop");

   //select the collection and perform the action
   let data = await db
        .collection("users")
        .findOne({email: req.body.email})
   
   data.admin=true
   let post = await db.collection("users").findOneAndUpdate({email: req.body.email},{$set: data})

   //close the connection
   await client.close();

   res.json({
     message: "User access changed",
   });
    } catch (error) {
        console.log(error);
        res.status(404).json({
           message: "something went wrong"
       })
    }
}

/*Remove admin */

export const removeadmin=async(req,res)=>{
    try {
        // connect the database

   let client = await mongoClient.connect(URL);

   //select the db
   let db = client.db("shop");

   //select the collection and perform the action
   let data = await db
        .collection("users")
        .findOne({email: req.body.email})
   
   data.admin=false
   let post = await db.collection("users").findOneAndUpdate({email: req.body.email},{$set: data})

   //close the connection
   await client.close();

   res.json({
     message: "User access changed",
   });
    } catch (error) {
        console.log(error);
        res.status(404).json({
           message: "something went wrong"
       })
    }
}
