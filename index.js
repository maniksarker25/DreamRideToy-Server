const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
//middle ware 
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=>{
    res.send('Dream Ride Toy Is Running')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.16yxiu9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db('toyDB').collection('toys')

    //get all toys---------------
    app.get('/allToys', async(req,res)=>{
        const result = await toyCollection.find().toArray();
        res.send(result)
    })
    
    //get single toy --------------------
    app.get('/allToys/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.findOne(query);
      res.send(result)
    })
    // get specific toys by email
    app.get('/myToys', async(req,res)=>{
      // console.log(req.query);
      let query = {};
      if(req.query?.email){
        query = {sellerEmail: req.query.email}
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result)
    })
    // get toy by search name
    app.get('/toy/:name', async(req,res)=>{
      const toyName = req.params.name;
      const result = await toyCollection.find({
        $or:[
          { toyName: { $regex: toyName, $options: "i" } }
        ]
      }).toArray();
      res.send(result)
    })
    // add toy 
    app.post('/addToy', async(req,res)=>{
        const toy = req.body;
        const result = await toyCollection.insertOne(toy);
        res.send(result)
    })

    // update toy
    app.patch('/toy/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set:{
          price:updatedToy.price,availableQuantity:updatedToy.availableQuantity, description:updatedToy.description
        }
      }
      const result = await toyCollection.updateOne(filter,toy,options);
      res.send(result)
    })
    // delete a toy
    app.delete('/myToys/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await toyCollection.deleteOne(query);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`Dream Ride Toy Is Running On Port:${port}`)
})