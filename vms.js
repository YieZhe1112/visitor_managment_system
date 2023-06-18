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






async function registerVisitor(regIC,regUsername,regPassword,regEmail,regRole){  //register visitor
   
    let result = await client.db("user").collection("visitor").findOne({
        username:regUsername
    })
   
    if(result._id == regIC){
        console.log("Your IC already exist. Please try to login")
    }

    else if(result.email == regEmail){
        console.log("Your email already exist. Please try to login")
    }

    else{
        await client.db("user").collection("visitor").insertOne({
            _id:regIC,
            username:regUsername,
            password:regPassword,
            email:regEmail,
            role:regRole
        })
        console.log(regUsername,"is successfully register")
    }
}

async function registerHost(regIC,regUsername,regPassword,regEmail,regRole){  //register host
    let result = await client.db("user").collection("visitor").findOne({
        username:regUsername
    })
   
    if(result._id == regIC){
        console.log("Your IC already exist. Please try to login")
    }

    else if(result.email == regEmail){
        console.log("Your email already exist. Please try to login")
    }

    else{
        await client.db("user").collection("host").insertOne({
            _id:regIC,
            username:regUsername,
            password:regPassword,
            email:regEmail,
            role:regRole
        })
        console.log(regUsername,"is successfully register")
    }
}

async function login(Username,Password){  //user and host login

    const option={projection:{_id:0,username:1,email:1,role:1}}  //pipeline to project usernamne and email

    const result = await client.db("user").collection("visitor").findOne({  
        $and:[
            {username:{$eq:Username}},
            {password:{$eq:Password}}
            ]
    },option)

    await client.db("user").collection("visitor").updateOne({  
        username:Username
    },
    {
        $currentDate: {
        "check-in time": true
     },
    })

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

async function deleteVisitorAcc(Username,Password){  //delete visitor acc
    const result = await client.db("user").collection("visitor").deleteOne({
        
        $and:[
            {username:{$eq:Username}},
            {password:{$eq:Password}}
            ]
    })

    if(result){
        console.log(result)
        console.log("Your account was successfully deleted")
    }
}

async function deleteHostAcc(Username,Password){  //delete host acc
    const result = await client.db("user").collection("host").deleteOne({
        
        $and:[
            {username:{$eq:Username}},
            {password:{$eq:Password}}
            ]
    })

    if(result){
        console.log(result)
        console.log("Your account was successfully deleted")
    }
}

function details(role){  //show details of visitor and host
    if (role == "visitor"){
        
        app.post('/login/visitor', (req, res) => {   //login
            res.send(login(req.body.username,req.body.password))
        })

        app.post('/login/visitor/delete', (req, res) => {   //delete
            res.send(deleteVisitorAcc(req.body.username,req.body.password))
        })
    }

    else if (role == "host"){
        
        app.post('/login/host', (req, res) => {   //login
            res.send(login(req.body.username,req.body.password))
        })

        app.post('/login/host/search', (req, res) => {   //look up visitor details
            res.send(searchVisitor(req.body.username))
        })

        app.post('/login/host/delete', (req, res) => {   //delete
            res.send(deleteHostAcc(req.body.username,req.body.password))
        })

        app.post('/login/host/addVisitor', (req, res) => {   //add visitor
            res.send(addVisitor(req.body.visitorName,req.body.phoneNumber,req.body.companyName))
        })

        app.post('/login/host/removeVisitor', (req, res) => {   //remove visitor
            res.send(removeVisitor(req.body.visitorName))
        })
    }
}

async function addVisitor(visitorName,phoneNumber,companyName){

    const result = await client.db("user").collection("host").updateOne({

    },{$push:{visitor:{name:visitorName,phone:phoneNumber,company:companyName}}},{upsert:true})
    console.log("Visitor",visitorName,"is successfully added")
}

async function removeVisitor(removeVisitor){

    const result = await client.db("user").collection("host").updateOne({
     
    },{$pull:{visitor:{name:removeVisitor}}},{upsert:true})
    console.log("Visitor",removeVisitor,"is successfully remove")
}

async function searchVisitor(Username){
    const option={projection:{_id:0,username:1,email:1,role:1}}  //pipeline to project usernamne and email

    const result = await client.db("user").collection("visitor").findOne({  
            username:{$eq:Username}
    },option)
    console.log(result)
}





app.use(express.json())

app.listen(port, () => {
    //console.log(`Successfully connect to port ${port}`)
  })

app.post("/register/visitor" , (req, res) => {  //register visitor
    res.send(registerVisitor(req.body._id,req.body.username,req.body.password,req.body.email,req.body.role))
    // console.log(req.body.username,"is successfully register")
})

app.post("/register/host" , (req, res) => {  //register host
    res.send(registerHost(req.body._id,req.body.username,req.body.password,req.body.email,req.body.role))
    // console.log(req.body.username,"is successfully register")
})

app.post('/login', (req, res) => {   //login
    res.send(login(req.body.username,req.body.password))
})
