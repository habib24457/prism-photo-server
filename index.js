const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const ObjectId = require("mongodb").ObjectID;

require("dotenv").config();

//const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.usac8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

//npx nodemon index.js

const uri =
  "mongodb+srv://habib99:z5BytpV589hSY0C3@cluster0.lkh1t2a.mongodb.net/?retryWrites=true&w=majority";

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("admin"));
app.use(fileUpload());

const port = 5000;

// mongoose.connect(uri,{
//     useNewUrlParser:true,useUnifiedTopology: true
// }).then(()=>{
//     console.log("Connection Successfull");

// }).catch((e)=>{
//     console.log("Not Connected",e);
// })

app.get("/", (req, res) => {
  res.send("Working...");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const appointmentCollection = client
    .db("prismPhotography")
    .collection("appointments");
  const adminCollection = client.db("prismPhotography").collection("admins");
  const reviewCollection = client.db("prismPhotography").collection("reviews");
  const paymentCollection = client.db("prismPhotography").collection("payment");

  console.log("Connected to MongoDB");
  //console.log("Error",err);

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    appointmentCollection.insertOne(appointment).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.put("/updateAppointment/:id", (req, res) => {
    const updatedData = req.body;
    //const id = req.params.id;
    const id = req.body._id;
    //console.log(id);
    const query = { _id: ObjectId(id) };

    const options = { upsert: true };

    //console.log(query);

    const updateDoc = {
      $set: {
        name: updatedData.name,
        phone: updatedData.phone,
        email: updatedData.email,
        gender: updatedData.gender,
        age: updatedData.age,
        service: updatedData.service,
        date: updatedData.date,
        price: updatedData.price,
      },
    };

    //console.log(updateDoc);

    const result = appointmentCollection.updateOne(query, updateDoc, options);
    res.send(result);

    // const item ={
    //     name:req.body.name,
    //     phone:req.body.phone,
    //     email:req.body.email,
    //     gender:req.body.gender,
    //     age:req.body.age,
    //     service:req.body.service,
    //     date:req.body.date,
    //     price:req.body.price
    // }

    // appointmentCollection.updateOne({"_id":ObjectId(id)},{$set:item},(err,result)=>{
    //     res.send(result);
    //     console.log(result);
    // })
    //console.log(updatedData,id);
  });

  app.delete("/deleteAppointment/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    const query = { _id: ObjectId(id) };
    console.log(query);
    const result = appointmentCollection.deleteOne(query);
    res.send(result);
  });

  app.get("/appointments", (req, res) => {
    appointmentCollection.find().toArray((err, appointments) => {
      res.send(appointments);
    });
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email = req.body.email;

    adminCollection.find({ email: email }).toArray((err, addedAdmin) => {
      const filter = { date: date.modDate };
      if (addedAdmin.length == 0) {
        filter.email = email;
      }

      appointmentCollection.find(filter).toArray((err, documents) => {
        res.send(documents);
      });
    });
  });

  app.get("/reviews", (req, res) => {
    reviewCollection.find().toArray((err, reviewData) => {
      res.send(reviewData);
    });
  });

  app.get("/getService", (req, res) => {
    //console.log(req.query.email)
    appointmentCollection
      .find({ email: req.query.email })
      .toArray((err, serviceData) => {
        res.send(serviceData);
      });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteReview/:id", (req, res) => {
    const id = req.params.id;
    //console.log(id);
    const query = { _id: ObjectId(id) };
    //console.log(query);
    const result = reviewCollection.deleteOne(query);
    res.send(result);
  });

  app.post("/addPayment", (req, res) => {
    const paymentDetails = req.body;
    //console.log(paymentDetails);

    paymentCollection.insertOne(paymentDetails).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/getPayment", (req, res) => {
    paymentCollection.find().toArray((err, payment) => {
      res.send(payment);
    });
    // //console.log(req.query.email)
    // paymentCollection.find({email: req.query.email})
    // .toArray((err, payment) => {
    //     res.send(payment);
    // })
  });

  app.post("/addOneAdmin", (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };

    adminCollection.insertOne({ name, email, image }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
});

app.listen(process.env.PORT || port);
