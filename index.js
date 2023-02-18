// In order to be able to run Google Cloud Storage on React check out:
// https://javascript.plainenglish.io/upload-files-to-google-cloud-storage-from-react-cf839d7361a5

require('dotenv').config()
var { Storage } = require("@google-cloud/storage");
const express = require("express");
var cors = require("cors");
var { format }  = require("util");
var Multer = require( "multer");
var path = require('path');

const app = express();
const port = process.env.PORT || 5000;

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
  },
});

app.use(cors());

const bucketName = process.env.BUCKET_NAME;
const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const projectId = process.env.PROJECT_ID

const cloudStorage = new Storage({
  keyFilename: credential,
  projectId: projectId,
});

// SETTING UP MONGOOSE
const bucket = cloudStorage.bucket(bucketName);

const mongoose = require('mongoose');
const SwapSet = require('./client/src/models/swapSet');

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB', error.message)
    })


// DOWNLOAD BEST SWAPSETS
app.get("/get-top-aggregate/:blockchain/:timestamp/:field1/:order1", (req, res, next) => {
  const blockchain = req.params.blockchain
  const timestamp = new Date(...req.params.timestamp.split('-'))
  const field1 = req.params.field1
  const ascending = req.params.order1 === 'ASC' ? 1 : -1

  console.log(blockchain, timestamp, field1, ascending)

  SwapSet.findOne({blockchain, timestamp: {$gte: timestamp}}).sort({[field1]: ascending})
    .then(result => {
      console.log(result)
      if (result !== undefined && result !== null) {
        res.status(200).send(result)
      } else {
        res.status(404)
      }
    })
})


// DOWNLOAD LIST SWAPSETS FOR TABLE
app.get("/get-list/:blockchain/:fields/:descending", (req, res, next) => {
  const blockchain = req.params.blockchain
  const fields = req.params.fields.split('&')
  const ascending = req.params.descending.split('&')

  const sortingObject = {}

  for (let i = 0; i < fields.length; i += 1) {
    sortingObject[fields[i]] = ascending[i]
  }

  SwapSet.find({blockchain}).sort(sortingObject).limit(40)
    .then(result => {
      if (result !== undefined && result !== null) {
        res.status(200).send(result)
      } else {
        res.status(404)
      }
    })
})


// DOWNLOAD FILE
app.get("/get-file/:blockchain/:year/:month/:day/:endPath", (req, res, next) => {
  const filename = `${req.params.blockchain}/${req.params.year}${req.params.month}/${req.params.day}/${req.params.endPath.replace('-','/')}`;

  console.log(`Fetching file ${filename}`);

  const file = bucket.file(filename);

  file.download((error, data) => {
    // res.set('Content-Type', 'text/html');
    if(error) {
      next(error);
    } else {
      console.log(`${filename} downloaded`);
      res.status(200).send(data);
    }
  });
});

// DOWNLOAD ALL FILENAMES INSIDE A GIVEN BLOCKCHAIN FOLDER
app.get("/get-files/:blockchain/", (req, res) => {
  const options = {
    prefix: `${req.params.blockchain}/`,
  };

  bucket.getFiles(options).then((response) => {
    const [files] = response;
    const fileNames = [];

    files.map((file) => {
      fileNames.push(file.name);
    });

    console.log(`File names from ${req.params.blockchain} blockchain downloaded`)
    res.status(200).send(fileNames);      
  })
});

// DOWNLOAD ALL FILENAMES AND CLASSIFY PAIRS ACCORDING TO QUOTE TOKEN
app.get("/get-scans/:blockchain/:year/:month/:day", (req, res) => {
  const options = {
    prefix: `${req.params.blockchain}/${req.params.year}${req.params.month}/${req.params.day}/SCANS/`,
  };

  bucket.getFiles(options).then((response) => {
    const [files] = response;
    const fileNames = [];

    files.map((file) => {
      // The file name returned by calling file.name is the complete path of the file:
      // e.g.: /30 seconds/WETHUSDC.json
      // The string.substring() function is used to get the symbol out of the file name
      let startCharacter = options.prefix.length;
      // let endCharacter = file.name.length - '.json'.length;
      let symbol = file.name.substring(startCharacter);
      fileNames.push(symbol);
    });

    console.log(`File names from ${options.prefix} downloaded`)
    res.status(200).send(fileNames);      
  })
});

app.use(express.static(path.join(__dirname, process.env.HTML_FOLDER)));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, process.env.HTML_FOLDER, 'index.html'));
});

app.listen(port, () => {
    console.log(`Storage downloader listening at http://localhost:${port}`);
});