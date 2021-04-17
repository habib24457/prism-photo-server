const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileUpload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.usac8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app=express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('admin'));
app.use(fileUpload());

const port =5000;

app.get('/',(req, res)=>{
    res.send("Working...");
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("prismPhotography").collection("appointments");
  const adminCollection = client.db("prismPhotography").collection("admins");
  const reviewCollection = client.db("prismPhotography").collection("reviews");
  console.log("Connect");

  app.post('/addAppointment',(req, res)=>{
      const appointment = req.body;
      appointmentCollection.insertOne(appointment)
      .then(result =>{
          res.send(result.insertedCount>0);
      })
  });

  app.post('/appointmentsByDate',(req, res)=>{
    const date = req.body;
    const email = req.body.email;

    adminCollection.find({ email: email })
        .toArray((err, addedAdmin) => {
            const filter = {date: date.modDate};
            if(addedAdmin.length ==0){
                filter.email = email;
            }

            appointmentCollection.find(filter)
            .toArray((err,documents)=>{
                res.send(documents);
            })

        })
});


app.get('/reviews', (req, res) => {
    reviewCollection.find()
        .toArray((err, reviewData) => {
            res.send(reviewData);
        })
});



app.post('/addReview', (req, res)=>{
    const review = req.body;
    reviewCollection.insertOne(review)
      .then(result =>{
          res.send(result.insertedCount>0);
      })
})

app.post('/addOneAdmin',(req, res)=>{
const file = req.files.file;
const name = req.body.name;
const email= req.body.email;
const newImg = file.data;
const encImg = newImg.toString('base64')

var image = {
    contentType: file.mimetype,
    size: file.size,
    img: Buffer.from(encImg, 'base64')
};

adminCollection.insertOne({ name, email, image })
.then(result => {
    res.send(result.insertedCount > 0);
})

})

  
});

app.listen(process.env.PORT ||port)