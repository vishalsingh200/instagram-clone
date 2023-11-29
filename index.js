//create a server using pure nodejs


// const { warn } = require("console");
// const http = require("http");

// const server = http.createServer((req, res) => {
//     console.log("server is created");
//     res.end("hi vishal");
// });

// server.listen(5000, "localhost", () => {
//     console.log("server is running on 5000");
// })





//create a server using express

const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const cors = require('cors');
const { mongoUrl } = require('./key')
const path = require('path');




//middleware  - it allow to change the request or a routing and Middleware framework for handling the different routing of the webpage
app.use(cors()) //allow us to connect with with different server having differnet domain
require('./models/models')
require('./models/post')
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/createPost'))
app.use(require('./routes/user'))


// app.get("/", (req, res) => {
//     res.json({ name: "Vishal", email: "vishal@123" })
// })


//mongodb
mongoose.connect(mongoUrl);
mongoose.connection.on("connected", () => {
    console.log("successfully connectd to mongo");
})
mongoose.connection.on("error", () => {
    console.log("not conntected");
})


//serving the frontend (npm run build)
app.use(express.static(path.join(__dirname, "./frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(
        path.join(__dirname, "./frontend/build/index.html"),
        function (err) {
            if (err) {
                console.error(err);
                res.status(500).send(err);
            }
        }
    )
})



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});