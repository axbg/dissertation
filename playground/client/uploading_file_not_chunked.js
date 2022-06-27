// create initial structures
const data = new ArrayBuffer(2);
const viewer = new Uint8Array(data);

// set data
viewer[0] = 0x01;
viewer[1] = 0xA5;

// prepare for upload
const blob = new Blob([viewer]);
const formData = new FormData();
formData.append('files', blob, 'encrypted.txt')

// upload
fetch("http://localhost:8080/api/upload", {
  method: 'POST',
  body: formData
})
.then(result => process.exit());