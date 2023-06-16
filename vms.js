const express = require('express')
const app = express()
const port = 3000

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://s2s3a:abc1234@record.55pqast.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

client.connect().then(res=>{
  console.log(res)
})

function register(regUsername,regPassword,regEmail,regRole){
    client.db("user").collection("visitor").insertOne({
        username:regUsername,
        password:regPassword,
        email:regEmail,
        role:regRole
    })
}

app.use(express.json())

app.listen(port, () => {
    console.log(`Successfully connect to port ${port}`)
  })

app.post("/register" , (req, res) => {
    res.send(register(req.body.username,req.body.password,req.body.email,req.body.role)) 
    console.log(req.body.username,"successfully register")
})