const express = require('express')
const router = express.Router()
const bcrypt = require("bcrypt");
const knex = require('knex');
const config = require('../knexfile')[process.env.NODE_ENV || "development"];
const database = knex(config);
const jwt = require('jsonwebtoken');

router.post("/", async (request, response) => {
    
    const { username, password } = request.body
    
    const foundUser = await database('user')
        .select()
        .where('username', username)
        .first()

    bcrypt.hash(password, 12).then(hashedPassword => {
        database('user')
        .insert({
            username, 
            password_hash: hashedPassword
        }).returning('*')
        .then(users => {
            response.status(201).json({...users[0]})
        })
    })

    if(foundUser) {
        response.status(401).json({status: 401})
    }
})

router.post('/login', async (request, response) => {
    
    const { username, password } = request.body
   
    const foundUser = await database('user')
        .select()
        .where('username', username)
        .first()

    if (!foundUser) {
        response.status(401).json({status: 401})
    }

    const isPasswordMatch = await bcrypt.compare(password, foundUser.password_hash)

    if (!isPasswordMatch) {
        response.status(401).json({status: 401})
    }


   const token =  jwt.sign({
        id: foundUser.id,
        username: foundUser.username
   }, process.env.SECRET)

   response.status(200).json(
       {token, foundUser} );
})

pathname = () => {
    const path = process.cwd()
    return path 
}

datetime = () => {
    let ts = Date.now()
    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    return (hours + ":" + minutes + ":" + seconds + " " + month + "-" + date + "-" + year)
}

router.get('/authenticate', async (request, response) => {
    
    const token = request.headers.authorization.split(" ")[1]

    if(!token) {
        response.sendStatus(401)
    }

    let id  
    try {
        id  = jwt.verify(token, process.env.SECRET).id 
    } catch(error) {
        response.sendStatus(403)
    }

    const user = await database("user")
        .select()
        .where("id", id)
        .first()
    
    let timestamp = datetime()
    
    let path = pathname()
   
    response.json({user, path, timestamp})
})

module.exports = router 