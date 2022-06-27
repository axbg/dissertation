const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Take in the request & filepath, stream the file to the filePath
const uploadFile = (req, filePath) => {
 return new Promise((resolve, reject) => {
  const stream = fs.createWriteStream('/Users/axbg/Desktop/testing.txt');
  // With the open - event, data will start being written
  // from the request to the stream's destination path
  stream.on('open', () => {
   console.log('Stream open ...  0.00%');
   req.pipe(stream);
  });

  // Drain is fired whenever a data chunk is written.
  // When that happens, print how much data has been written yet.
  stream.on('drain', () => {
   const written = parseInt(stream.bytesWritten);
   const total = parseInt(req.headers['content-length']);
   const pWritten = ((written / total) * 100).toFixed(2);
   console.log(`Processing  ...  ${pWritten}% done`);
  });

  // When the stream is finished, print a final message
  // Also, resolve the location of the file to calling function
  stream.on('close', () => {
   console.log('Processing  ...  100%');
   resolve(filePath);
  });
   // If something goes wrong, reject the primise
  stream.on('error', err => {
   console.error(err);
   reject(err);
  });
 });
};

const app = express();

app.use(cors());

app.use(express.static('static'));

// Add a route to accept incoming post requests for the fileupload.
// Also, attach two callback functions to handle the response.
app.post('/', (req, res) => {
 const filePath = path.join(__dirname, `/image.jpg`);
 uploadFile(req, filePath)
  .then(path => res.send({ status: 'success', path }))
  .catch(err => res.send({ status: 'error', err }));
});

const key = fs.readFileSync('./keys/localhost-key.pem');
const cert = fs.readFileSync('./keys/localhost.pem');
const credentials = {key: key, cert: cert};

const spdy = require('spdy');
spdy
.createServer(credentials, app)
.listen(8080, (error) => {
  if (error) {
    console.error(error)
    return process.exit(1)
  } else {
    console.log('Listening on port: ' + 8080 + '.')
  }
})