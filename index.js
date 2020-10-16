const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgaci.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('doctors'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("Creative-Agency").collection("services");
  const placeOrderCollection = client.db("Creative-Agency").collection("placeOrder");
  

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const filePath = `${__dirname}/services/${file.name}`;

    file.mv(filePath, err => {
      if(err){
        res.status(500).send({message: "Failed to upload image"});
      }

      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      var image = {
        contentType: req.files.file.mimeType,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      }

      serviceCollection.insertOne({title, description, image})
      .then(result => {
        fs.remove(filePath, error => {
          if(error){
            console.log(error);
            res.status(500).send({message: "Failed to upload Image "});
          }
          res.send(result.insertedCount > 0)
        })
      })

      return res.send({name: file.name, path: `/${file.name}`})

    })

  })

  app.get('/getServices', (req,res) => {
    serviceCollection.find({})
    .toArray((err, docs)=>{
      res.status(200).send(docs);
    })
  })



  app.post('/placeOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const selectedServiceName = req.body.selectedServiceName;
    const description = req.body.description;
    const price = req.body.price;
    const serviceId = req.body.serviceId;
    const filePath = `${__dirname}/placeOrder/${file.name}`;

    file.mv(filePath, err => {
      if(err){
        res.status(500).send({message: "Failed to upload image"});
      }

      const newImg = fs.readFileSync(filePath);
      const encImg = newImg.toString('base64');

      var image = {
        contentType: req.files.file.mimeType,
        size: req.files.file.size,
        img: Buffer(encImg, 'base64')
      }

      placeOrderCollection.insertOne({name, email, selectedServiceName, description, price, image, serviceId})
      .then(result => {
        fs.remove(filePath, error => {
          if(error){
            console.log(error);
            res.status(500).send({message: "Failed to upload Image "});
          }
          res.send(result.insertedCount > 0)
        })
      })

      return res.send({name: file.name, path: `/${file.name}`})

    })

  })


  app.post('/getUserOrderList', (req,res) => {
    const email = req.body.email;
    console.log(email)
    placeOrderCollection.find({email: email})
    .toArray((err, docs)=>{
      res.status(200).send(docs);
    })
  })

//   app.post('/getOrderedServiceList', (req,res) => {
//     const selectedServiceName = req.body.selectedServiceName;

//     serviceCollection.find({title: selectedServiceName})
//       .toArray((err, docs)=>{
//       res.status(200).send(docs);
    
//   })

// });




});

// const PORT = process.env.PORT || 5000
const port = 5000
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})