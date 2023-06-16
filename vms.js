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
    if (res){
        console.log("Welcome to visitor managment system")
    }
  
})





async function registerVisitor(regUsername,regPassword,regEmail,regRole){  //register visitor
    await client.db("user").collection("visitor").insertOne({
        username:regUsername,
        password:regPassword,
        email:regEmail,
        role:regRole
    })
}

async function registerHost(regUsername,regPassword,regEmail,regRole){  //register host
    await client.db("user").collection("host").insertOne({
        username:regUsername,
        password:regPassword,
        email:regEmail,
        role:regRole
    })
}

async function login(Username,Password,Role){  //login
    if (Role == "visitor"){
        const option={projection:{_id:0,username:1,email:1}}  //pipeline to project usernamne and email

        const result = await client.db("user").collection("visitor").findOne({
            $and:[
                {username:{$eq:Username}},
                {password:{$eq:Password}}
                ]
        },option)

        if(result){
            console.log(result)
            console.log("Successfully Login")
        }
        else {
            console.log("User not found or password error")
        }
    }
    
    else if (Role == "host"){
        const option={projection:{_id:0,username:1,email:1}}  //pipeline to project usernamne and email

        const result = await client.db("user").collection("host").findOne({
            $and:[
                {username:{$eq:Username}},
                {password:{$eq:Password}}
                ]
        },option)

        if(result){
            console.log(result)
            console.log("Successfully Login")
        }
        else {
            console.log("User not found or password error")
        }
    }
}





app.use(express.json())

app.listen(port, () => {
    //console.log(`Successfully connect to port ${port}`)
  })

app.post("/register/visitor" , (req, res) => {
    res.send(registerVisitor(req.body.username,req.body.password,req.body.email,req.body.role)) 
    console.log(req.body.username,"is successfully register")
})

app.post("/register/host" , (req, res) => {
    res.send(registerHost(req.body.username,req.body.password,req.body.email,req.body.role)) 
    console.log(req.body.username,"is successfully register")
})

app.post('/login', (req, res) => { 
    res.send(login(req.body.username,req.body.password,req.body.role))
  })