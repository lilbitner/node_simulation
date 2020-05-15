require("dotenv").config();

const express = require('express');
const app = express();
const port = process.env.PORT || 5000

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const bcrypt = require("bcrypt");
const knex = require('knex');
const config = require('./knexfile')[process.env.NODE_ENV || "development"];
const database = knex(config);
const jwt = require('jsonwebtoken');

const userData = require('./routes/user')
app.use("/users", userData)


app.listen(port, () => console.log(`listening on ${port}`))