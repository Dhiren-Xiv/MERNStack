const express = require('express');
const connectDb = require('./config/db');
// connect to DataBase.
connectDb();
const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Api running")
})

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));
app.listen(PORT, () => {
    console.log(`Server Started on ${PORT}`);
});