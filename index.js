const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fgaci.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()
const port = 5000

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db(process.env.DB_NAME).collection("services");
  

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const des = req.body.des;
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

      serviceCollection.insertOne({title, des, image})
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



});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})