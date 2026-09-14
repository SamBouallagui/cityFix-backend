require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/auth.routes');
const app = express();

app.use(cors()); //Allows cross-origin requests
app.use(express.json()); //Parses JSON request bodies
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 3000;

//listens for requests when the connection has been established
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established.');
    return sequelize.sync({ alter: true }); //ORM
  })
  .then(() => {
    console.log('tables created/updated.');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to connect or sync database:', err);
  });
