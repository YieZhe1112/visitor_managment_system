const express = require('express')
const app = express()
const port = 3000

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://s2s3a:abc1234@record.55pqast.mongodb.net/?retryWrites=true&w=majority";

//global variables
global.l = "true"   
var host
var role

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
        l = "true"
        role = "visitor"
        //details(result.role)
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
            l = "true"
            role = "host"
            //details(result.role)
            
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
                console.log(result)
                console.log("Successfully Login")
                l = "true"
                role = "security"
                //details(result.role)
                
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

    if(result.deletedCount == 1){
        console.log(result)
        console.log("The account was successfully deleted")
    }
    else{
        console.log("The account you was tried to delete doesn't exist")
    }
}

async function deleteHostAcc(Username){  //delete host acc
    const result = await client.db("user").collection("host").deleteOne({
        username:{$eq:Username}
    })

    await client.db("user").collection("visitor").updateMany({
        
    },{$pull:{host:{name:Username}}},{upsert:true})

    if(result.deletedCount == 1){   //if the acc exists, delete the acc
        console.log(result)
        console.log("The account was successfully deleted")
    }
    else{   
        console.log("The account you was tried to delete doesn't exist")
    }
}

async function updateVisitorPass(regPassword){  //change only when password is different
    result = await client.db("user").collection("visitor").findOne ({username:{$eq:visitor}})

    if (result.password != regPassword){
        await client.db("user").collection("visitor").updateOne({
            username:{$eq:visitor}
        },{$set:{password:regPassword}})

        console.log("Password",visitor,"is successfully updated")
    }
    else
        console.log ("Same password cannot be applied")
}        

async function updateHostPass(regPassword){

    result = await client.db("user").collection("host").findOne ({username:{$eq:host}})

    if (result.password != regPassword){
        await client.db("user").collection("host").updateOne({
            username:{$eq:host}
        },{$set:{password:regPassword}})

        console.log("Password",host,"is successfully updated")
    }
    else
        console.log ("Same password cannot be applied")
}

async function addVisitor(visitorIC,visitorName,phoneNumber,companyName,date,time){

    let result = await client.db("user").collection("host").findOne({username: host, "visitor.name": visitorName, "visitor.phone": phoneNumber})
    
    if (!result){
        await client.db("user").collection("host").updateOne({
            username: host
        },{$push:{visitor:{name:visitorName,phone:phoneNumber,company:companyName,date:date,time:time}}},{upsert:true})

         let result = await client.db("user").collection("visitor").findOne({
            username:{$eq:visitorName}
        })

        if (!result){
            await client.db("user").collection("visitor").insertOne({
                "_id":visitorIC,
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
    else
        console.log ("The visitor has already been added")
}

async function removeVisitor(removeVisitor,removeDate,removeTime){

    await client.db("user").collection("host").updateOne({
        username: host
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

//HTTP login method
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


//visitor HTTP methods    
        
app.post('/login/visitor', (req, res) => {   //login
    res.send(login(req.body.username,req.body.password))
})

app.post('/login/visitor/updatePassword', (req, res) => {   //login
    if ((role == "visitor") && (l == "true"))
        res.send(updateVisitorPass(req.body.password))
    else
        console.log ("You are not a visitor")
})

app.get('/login/visitor/logout', (req, res) => {
    if ((role == "visitor") && (l == "true")){
        console.log("You have successfully log out")
        l = "false"
    }
    else
        console.log ("You had log out")
})
    
//host http method 

app.post('/login/host', (req, res) => {   //login
    
    res.send(login(req.body.username,req.body.password))
    
})

app.post('/login/host/updatePassword', (req, res) => {   //login
    if ((role == "host") && (l == "true"))
        res.send(updateHostPass(req.body.password))
    else
        console.log ("You are not a host")
})

app.post('/login/host/search', (req, res) => {   //look up visitor details
    if ((role == "host") && (l == "true"))
        res.send(searchVisitor(req.body._id))
    else
        console.log ("You are not a host")
})

app.post('/login/host/addVisitor', (req, res) => {   //add visitor
    if ((role == "host") && (l == "true"))
        res.send(addVisitor(req.body.Ic,req.body.visitorName,req.body.phoneNumber,req.body.companyName,req.body.date,req.body.time))
    else
        console.log ("You are not a host")
})

app.post('/login/host/removeVisitor', (req, res) => {   //remove visitor
    if ((role == "host") && (l == "true"))
        res.send(removeVisitor(req.body.visitorName,req.body.date,req.body.time))
    else
        console.log ("You are not a host")
})

app.get('/login/host/logout', (req, res) => { 
    if ((role == "host") && (l == "true")){
        console.log("You have successfully log out")
        l = "false"    
    }   
    else
        console.log ("You had log out")
})
    
//security http mehtods    

app.post("/login/security/deleteHost" , (req, res) => {  //delete host
    if ((role == "security") && (l == "true"))
        res.send(deleteHostAcc(req.body.username))
    else
        console.log ("You are not a security")
})

app.post("/login/security/deleteVisitor" , (req, res) => {  //delete visitor
    if ((role == "security") && (l == "true"))
        res.send(deleteVisitorAcc(req.body.username))
    else
        console.log ("You are not a security")
})

app.post("/login/security/register/visitor" , (req, res) => {  //register visitor
    if ((role == "security") && (l == "true"))
        res.send(registerVisitor(req.body._id,req.body.username,req.body.password,req.body.email,req.body.role,req.body.lastCheckinTime))
    else
        console.log ("You are not a security")
})
        
app.post("/login/security/register/host" , (req, res) => {  //register host
    if ((role == "security") && (l == "true"))
        res.send(registerHost(req.body._id,req.body.username,req.body.password,req.body.email,req.body.role))    
    else
        console.log ("You are not a security")     
})

app.get('/login/security/logout', (req, res) => {
    if ((role == "security") && (l == "true")){
        console.log("You have successfully log out")
        l = "false"
    }
    else
        console.log ("You had log out")
})
   
