import React, { useCallback, useState } from 'react';
import styles from './Upload.module.css';
import { generateSecurePassword, encryptWithPublicKey, arrayBufferToBase64, generateSymmetricKey, exportSymmetricKey, symmetricEncrypt } from '../../shared/crypto';
import { concat } from 'uint8arrays/concat';
import { splitChunk, hardCopyArray } from '../../shared/utils';

const Upload = () => {
  // 1MB
  const CHUNK_SIZE = 1000000;

  let uploadInProgress = false;
  const uploadErrors = [];

  let currentChunk = new Uint8Array(0);
  let chunkOrder = 0;

  const [fileHandle, setFileHandle] = useState(null);
  const [filename, setFilename] = useState("No file was selected");
  const [fileId, setFileId] = useState("");

  const handleOnSelectFileButtonClick = useCallback((async () => {
    const openFileHandler = await window.showOpenFilePicker();

    if (openFileHandler[0].kind === 'file') {
      setFileHandle(openFileHandler[0]);
      setFilename(openFileHandler[0].name);
    }
  }), []);

  const handleChunk = (chunk, key) => {
    do {
      if((currentChunk.length + chunk.length) <= CHUNK_SIZE) {
        currentChunk = concat([currentChunk, chunk]);
        chunk = null;
      } else {
        const spaceLeft = CHUNK_SIZE - currentChunk.length;
        const [chunk1, chunk2] = splitChunk(spaceLeft, chunk);

        chunk = chunk2;

        currentChunk = concat([currentChunk, chunk1]);
        chunkOrder += 1;
  
        encryptChunk(hardCopyArray(currentChunk), chunkOrder, key);

        currentChunk = new Uint8Array(0);
      }
    } while(chunk);
  }

  const encryptChunk = async (chunk, chunkOrder, key) => {
    const encryptedChunk = await symmetricEncrypt(chunk, key);
    uploadChunk(encryptedChunk, chunkOrder)
  }

  const uploadChunk = (chunk, order) => {
    uploadInProgress = true;

    // UPLOAD CHUNK 
    
    console.log(chunk);
    console.log(order);
    uploadInProgress = false;
  }

  const finishUpload = async (key) => {
    chunkOrder += 1;
    encryptChunk(currentChunk, chunkOrder, key);

    currentChunk = new Uint8Array(0);
    chunkOrder = 0;

    // WAIT UNTIL NO MORE CALLS ARE IN PROGRESS
    // check uploadInProgress

    // CREATE FILE UPLOAD FINISHED ENTRY



    // REDIRECT TO DOWNLOAD PAGE
  }

  const handleOnUploadButtonClick = useCallback((async () => {
    // GENERATE PASSWORD
    const symmetricKey = await generateSymmetricKey();
    const exportedSymmetricKey = await exportSymmetricKey(symmetricKey);

    // ENCRYPT GENERATED PASSWORD WITH PUBLIC KEY
    const encryptedPasswordBytes = await encryptWithPublicKey(window.localStorage.getItem("publicKey"), new Uint8Array(exportedSymmetricKey));
    const encryptedPasswordB64 = arrayBufferToBase64(encryptedPasswordBytes);

    // INIT FILE HANDLING
    const file = await fileHandle.getFile();
    const fileStream = await file.stream();
    const fileReader = await fileStream.getReader();

    // CREATE FILE UPLOAD ENTRY


    // STREAM FILE AND ENCRYPT IN CHUNKS
    // UPLOAD EACH CHUNK TO SERVER
    fileReader.read()
      .then(function processChunk({ done, value }) { 
        if(done) {
          finishUpload(symmetricKey);
          return;
        }

        handleChunk(value, symmetricKey);
        return fileReader.read().then(processChunk);
      });
  }), [fileHandle]);

return (
  <div className={styles.Upload}>
    <label className={styles.uploadLabel} onClick={handleOnSelectFileButtonClick}>Click to select a file for upload</label>
    <br />
    <br />
    <p>Selected file: {filename}</p>
    <br />
    <button onClick={handleOnUploadButtonClick}>Upload</button>
  </div>
);
};

export default Upload;
