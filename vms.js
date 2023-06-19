const express = require('express')
const app = express()
const port = 3000

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://s2s3a:abc1234@record.55pqast.mongodb.net/?retryWrites=true&w=majority";

var l 

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
        l = "false"
    }
  
})






async function registerVisitor(regIC,regUsername,regPassword,regEmail,regRole,regLast){  //register visitor
   
    if (await client.db("user").collection("visitor").findOne({_id : regIC})){
        console.log ("Your IC has already registered in the system")
    }
    
    else {
        if( await client.db("user").collection("visitor").findOne({username: regUsername})){
            console.log("Your Username already exist. Please try to login")
        }

        else if(await client.db("user").collection("visitor").findOne({email: regEmail})){
            console.log("Your email already exist. Please try to login")
        }

        else{
            await client.db("user").collection("visitor").insertOne({
                "_id":regIC,
                "username":regUsername,
                "password":regPassword,
                "email":regEmail,
                "role":regRole,
                "lastCheckinTime" :regLast
            })
            console.log(regUsername,"is successfully register")
        }
    }
}

async function registerHost(regIC,regUsername,regPassword,regEmail,regRole){  //register host
    if (await client.db("user").collection("host").findOne({_id : regIC})){
        console.log ("Your IC has already registered in the system")
    }
    
    else {
        if( await client.db("user").collection("host").findOne({username: regUsername})){
            console.log("Your Username already exist. Please try to login")
        }

        else if(await client.db("user").collection("host").findOne({email: regEmail})){
            console.log("Your email already exist. Please try to login")
        }

        else{
            await client.db("user").collection("host").insertOne({
                "_id":regIC,
                "username":regUsername,
                "password":regPassword,
                "email":regEmail,
                "role":regRole
            })
            console.log(regUsername,"is successfully register")
        }
    }
}

async function login(Username,Password){  //user and host login

    const option={projection:{password:0}}  //pipeline to project usernamne and email

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
        "lastCheckinTime": true
     },
    })

    if(result){
        visitor = result.username
        console.log(result)
        console.log("Successfully Login")
        details(result.role)
        l = "true"
    }
    else {
        const option={projection:{password:0}}  //pipeline to project usernamne and email

        const result = await client.db("user").collection("host").findOne({
            $and:[
                {username:{$eq:Username}},
                {password:{$eq:Password}}
                ]
        },option)

        if(result){
            host = result.username
            console.log(result)
            console.log("Successfully Login")
            details(result.role)
            l = "true"
        }
        else {
            const option={projection:{password:0}}  //pipeline to project usernamne and email

            const result = await client.db("user").collection("security").findOne({
                $and:[
                    {username:{$eq:Username}},
                    {password:{$eq:Password}}
                    ]
            },option)

            if(result){
                security = result.username
                console.log(result)
                console.log("Successfully Login")
                details(result.role)
                l = "true"
            }
            else{
                console.log("User not found or password error")
            }
        } 
    }
}

async function deleteVisitorAcc(Username){  //delete visitor acc
    const result = await client.db("user").collection("visitor").deleteOne({
        username:{$eq:Username}
    })

    await client.db("user").collection("host").updateMany({
     
    },{$pull:{visitor:{name:Username}}},{upsert:true})

    if(result){
        console.log(result)
        console.log("The account was successfully deleted")
    }
}

async function deleteHostAcc(Username){  //delete host acc
    const result = await client.db("user").collection("host").deleteOne({
        username:{$eq:Username}
    })

    await client.db("user").collection("visitor").updateMany({
        
    },{$pull:{host:{name:Username}}},{upsert:true})

    if(result){
        console.log(result)
        console.log("The account was successfully deleted")
    }
}

function details(role){  //show details of visitor and host
    if (role == "visitor"){
        
        app.post('/login/visitor', (req, res) => {   //login
            res.send(login(req.body.username,req.body.password))
        })

        app.post('/login/visitor/updatePassword', (req, res) => {   //login
            res.send(updateVisitorPass(req.body.password))
        })

        app.get('/login/visitor/logout', (req, res) => {
            console.log("You have successfully log out")
            l = "false"
        })
    }

    else if (role == "host"){
        
        app.post('/login/host', (req, res) => {   //login
            res.send(login(req.body.username,req.body.password))
        })

        app.post('/login/host/updatePassword', (req, res) => {   //login
            res.send(updateHostPass(req.body.password))
        })

        app.post('/login/host/search', (req, res) => {   //look up visitor details
            res.send(searchVisitor(req.body._id))
        })

        app.post('/login/host/addVisitor', (req, res) => {   //add visitor
            res.send(addVisitor(req.body.visitorName,req.body.phoneNumber,req.body.companyName,req.body.date,req.body.time))
        })

        app.post('/login/host/removeVisitor', (req, res) => {   //remove visitor
            res.send(removeVisitor(req.body.visitorName,req.body.date,req.body.time))
        })

        app.get('/login/host/logout', (req, res) => { 
            console.log("You have successfully log out")
            l = "false"
        })
    }
    else if (role == "security"){
        
        app.post("/login/security/updatePassword" , (req, res) => {  //delete host
            res.send(updateSecurityPass(req.body.password))
        })

        app.post("/login/security/deleteHost" , (req, res) => {  //delete host
            res.send(deleteHostAcc(req.body.username))
        })

        app.post("/login/security/deleteVisitor" , (req, res) => {  //delete visitor
            res.send(deleteVisitorAcc(req.body.username))
        })

        app.post("/login/security/register/visitor" , (req, res) => {  //register visitor
            res.send(registerVisitor(req.body._id,req.body.username,req.body.password,req.body.email,req.body.role,req.body.lastCheckinTime))
        })
        
        app.post("/login/security/register/host" , (req, res) => {  //register host
            res.send(registerHost(req.body._id,req.body.username,req.body.password,req.body.email,req.body.role))         
        })

        app.get('/login/security/logout', (req, res) => {
            console.log("You have successfully log out")
            l = "false"
        })
    }
}

async function updateSecurityPass(regPassword){

    await client.db("user").collection("security").updateOne({
        username:{$eq:security}
    },{$set:{password:regPassword}})

    console.log("Password",security,"is successfully updated")
}

async function updateVisitorPass(regPassword){

    await client.db("user").collection("visitor").updateOne({
        username:{$eq:visitor}
    },{$set:{password:regPassword}})

    console.log("Password",visitor,"is successfully updated")
}

async function updateHostPass(regPassword){

    await client.db("user").collection("host").updateOne({
        username:{$eq:host}
    },{$set:{password:regPassword}})

    console.log("Password",host,"is successfully updated")
}

async function addVisitor(visitorName,phoneNumber,companyName,date,time){

    await client.db("user").collection("host").updateOne({

    },{$push:{visitor:{name:visitorName,phone:phoneNumber,company:companyName,date:date,time:time}}},{upsert:true})

    let result = await client.db("user").collection("visitor").findOne({
        username:{$eq:visitorName}
    })

    if (!result){
        await client.db("user").collection("visitor").insertOne({
            "_id":"000000-00-0000",
            "username":visitorName,
            "password":111111,
            "email":"xxxx",
            "role":"visitor",
            "lastCheckinTime" :"not check in yet"
        })

        await client.db("user").collection("visitor").updateOne({
            username:{$eq:visitorName}
        },{$push:{host:{name:host,date:date,time:time}}})
    }
    else{
        await client.db("user").collection("visitor").updateOne({
            username:{$eq:visitorName}
        },{$push:{host:{name:host,date:date,time:time}}})
    }

    console.log("Visitor",visitorName,"is successfully added")
}

async function removeVisitor(removeVisitor,removeDate,removeTime){

    await client.db("user").collection("host").updateOne({

    },{$pull:{visitor:{name:removeVisitor},visitor:{date:removeDate},visitor:{time:removeTime}}},{upsert:true})


    await client.db("user").collection("visitor").updateOne({
     
    },{$pull:{host:{name:host}}},{upsert:true})

    console.log("Visitor",removeVisitor,"is successfully remove")
}

async function searchVisitor(IC){
    const option={projection:{password:0,role:0}}  //pipeline to project usernamne and email

    const result = await client.db("user").collection("visitor").findOne({
        _id:{$eq:IC}
    },option)
    console.log(result)
}





app.use(express.json())

app.listen(port, () => {
  })

app.post('/login', (req, res) => {   //login
    if(l == "false"){
        res.send(login(req.body.username,req.body.password))
    }
    else{
        console.log("...")
    }
})

