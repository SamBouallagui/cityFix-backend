require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
const app = express();

app.use(cors()); //Allows cross-origin requests
app.use(express.json()); //Parses JSON request bodies
