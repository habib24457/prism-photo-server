const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const ObjectID = require('mongodb').ObjectID;
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
  const paymentCollection = client.db("prismPhotography").collection("payment");
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
    //console.log(date);

    adminCollection.find({ email: email })
        .toArray((err, addedAdmin) => {
            const filter = {date: date.modDate};
            //console.log(filter)
            if(addedAdmin.length ==0){
                filter.email = email;
            }

            appointmentCollection.find(filter)
            .toArray((err,documents)=>{
                res.send(documents);
            })

        })
});


//testing :worked
app.post('/byDate',(req, res)=>{
    const date = req.body;
    appointmentCollection.find({date: date.date})
    .toArray((err,documents)=>{
        res.send(documents);
    })  
})


//checking admin 
app.get('/checkAdmin/:email', (req, res)=>{
    const email = req.params.email;
    adminCollection.find({email:email})
    .toArray((err, admins) => {
      res.send(admins.length>0);
    })
})

//remove appointments after done by admin
app.delete('/removeClientAppointment/:id',(req, res)=>{
    const id = req.params.id;
    appointmentCollection.findOneAndDelete({_id:ObjectID(id)})
    .then (result => {
        res.send(result.deletedCount > 0);
    })
})


app.get('/reviews', (req, res) => {
    reviewCollection.find()
        .toArray((err, reviewData) => {
            res.send(reviewData);
        })
});

app.get('/getService',(req, res)=>{
    //console.log(req.query.email)
    appointmentCollection.find({email: req.query.email})
    .toArray((err, serviceData) => {
        res.send(serviceData);
    })
})

/** 
app.delete('/removeItem/:id',(req, res)=>{
    const id = req.params.id;
    console.log(id);
appointmentCollection.findOneAndDelete({_id:ObjectId(id)})
.then(result=>{
    res.send(result.deletedCount > 0);
})
})
*/


app.delete('/removeItem/:id', (req, res) => {
   // const id =ObjectID(req.params.id);
  //  console.log('deleting',id);
    appointmentCollection.findOneAndDelete({ _id: ObjectID(req.params.id) })
      .then(result => {
        res.send(result.deletedCount > 0);
      })
  })


app.post('/addReview', (req, res)=>{
    const review = req.body;
    reviewCollection.insertOne(review)
      .then(result =>{
          res.send(result.insertedCount>0);
      })
})

app.delete('/removeReview/:id', (req, res)=>{
    const id = req.params.id;
    reviewCollection.findOneAndDelete({ _id: ObjectID(id) })
    .then(result =>{
        res.send(result.deletedCount>0);
    })
})

app.post('/addPayment', (req, res)=>{
    const payment = req.body;
    paymentCollection.insertOne(payment)
      .then(result =>{
          res.send(result.insertedCount>0);
      })
})

app.get('/getPayment', (req, res)=>{
    paymentCollection.find()
    .toArray((err,paymentData)=>{
        res.send(paymentData);
    })
})

app.delete('/removeClientOrder/:id', (req, res)=>{
    const id = req.params.id;
    paymentCollection.findOneAndDelete({ _id: ObjectID(id) })
    .then(result=>{
        res.send(result.deletedCount > 0);
    })
})

app.post('/addOneAdmin',(req, res)=>{
    const admin = req.body;
    adminCollection.insertOne(admin)
    .then(result=>{
        res.send(result.insertedCount>0); 
    })
})

app.get('/getAdmin', (req, res)=>{
    adminCollection.find()
        .toArray((err, adminData) => {
            res.send(adminData);
        })
})

app.delete('/removeAdmin/:id', (req, res)=>{
    const id = req.params.id;
    adminCollection.findOneAndDelete({ _id: ObjectID(id) })
    .then(result=>{
        res.send(result.deletedCount > 0);
    })
})

/** 
app.post('/addOneAdmin',(req, res)=>{
//const file = req.files.file;
const name = req.body.name;
const email= req.body.email;
// const newImg = file.data;
// const encImg = newImg.toString('base64')

// var image = {
//     contentType: file.mimetype,
//     size: file.size,
//     img: Buffer.from(encImg, 'base64')
// };

adminCollection.insertOne({ name, email })
.then(result => {
    res.send(result.insertedCount > 0);
})

})  
*/

});


app.listen(process.env.PORT ||port)