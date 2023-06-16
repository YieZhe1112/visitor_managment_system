const express = require('express')
const app = express()
const port = 3000
const jwt = require('jsonwebtoken')

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

async function login(Username,Password){  //login

    const option={projection:{_id:0,username:1,email:1,role:1}}  //pipeline to project usernamne and email

    const result = await client.db("user").collection("visitor").findOne({
        $and:[
            {username:{$eq:Username}},
            {password:{$eq:Password}}
            ]
    },option)

    if(result){
        console.log(result)
        console.log("Successfully Login")
        details(result.role)
    }
    else {
        const option={projection:{_id:0,username:1,email:1,role:1}}  //pipeline to project usernamne and email

        const result = await client.db("user").collection("host").findOne({
            $and:[
                {username:{$eq:Username}},
                {password:{$eq:Password}}
                ]
        },option)

        if(result){
            console.log(result)
            console.log("Successfully Login")
            details(result.role)
        }
        else {
            console.log("User not found or password error")
        } 
    }
}

async function deleteAcc(Username,Password){  //delete acc
    const result = await client.db("user").collection("visitor").deleteOne({
        $and:[
            {username:{$eq:Username}},
            {password:{$eq:Password}}
            ]
    })

    if(result){
        console.log(result)
        console.log("Successfully deleted")
    }

    else{
        const result = await client.db("user").collection("host").deleteOne({
            $and:[
                {username:{$eq:Username}},
                {password:{$eq:Password}}
                ]
        })

        if(result){
            console.log(result)
            console.log("Successfully deleted")
        }
    }
}

function details(role){  //show details of visitor and host
    if (role == "visitor"){
        console.log("v")
        app.post('/login/visitor', (req, res) => {   //login
            res.send(login(req.body.username,req.body.password))
        })
    }

    else if (role == "host"){
        console.log("h")
        app.post('/login/host', (req, res) => {   //login
            res.send(login(req.body.username,req.body.password))
        })

        app.post('/login/host/add', (req, res) => {   //login
            res.send(addVisitor(req.body.visitor))
        })
    }
}

async function addVisitor(addVisitor){
    // const option = {projection:{_id:0,username:1,email:1,visitor:1},
    //                 lookup:{from: "visitor",localField: "visitor",foreignField: "username",as: "visitorDetail",
    // }}
    
    const result = await client.db("user").collection("host").updateOne({

    },{$set:{visitor:addVisitor}},{upsert:true})
}





app.use(express.json())

app.listen(port, () => {
    //console.log(`Successfully connect to port ${port}`)
  })

app.post("/register/visitor" , (req, res) => {  //register visitor
    res.send(registerVisitor(req.body.username,req.body.password,req.body.email,req.body.role))
    console.log(req.body.username,"is successfully register")
})

app.post("/register/host" , (req, res) => {  //register host
    res.send(registerHost(req.body.username,req.body.password,req.body.email,req.body.role))
    console.log(req.body.username,"is successfully register")
})

app.post('/login', (req, res) => {   //login
    res.send(login(req.body.username,req.body.password))
})

app.post('/delete', (req, res) => {   //delete
    res.send(deleteAcc(req.body.username,req.body.password))
})