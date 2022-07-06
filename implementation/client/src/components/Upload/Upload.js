import React, { useCallback, useState } from 'react';
import styles from './Upload.module.css';
import { encryptWithPublicKey, arrayBufferToBase64, generateSymmetricKey, exportSymmetricKey, symmetricEncrypt } from '../../shared/crypto';
import { concat } from 'uint8arrays/concat';
import { splitChunk, hardCopyArray } from '../../shared/utils';
import { CONSTANTS } from '../../shared/constants';
import {useNavigate} from 'react-router-dom';

const Upload = () => {
  // 1MB
  const CHUNK_SIZE = 1000000;

  const finishedUploads = [];
  const uploadErrors = [];

  let currentChunk = new Uint8Array(0);
  let chunkOrder = 0;

  const [fileHandle, setFileHandle] = useState(null);
  const [filename, setFilename] = useState("No file was selected");

  const navigate = useNavigate();

  const handleOnSelectFileButtonClick = useCallback((async () => {
    const openFileHandler = await window.showOpenFilePicker();

    if (openFileHandler[0].kind === 'file') {
      setFileHandle(openFileHandler[0]);
      setFilename(openFileHandler[0].name);
    }
  }), []);

  const handleChunk = (chunk, key, fileId) => {
    do {
      if ((currentChunk.length + chunk.length) <= CHUNK_SIZE) {
        currentChunk = concat([currentChunk, chunk]);
        chunk = null;
      } else {
        const spaceLeft = CHUNK_SIZE - currentChunk.length;
        const [chunk1, chunk2] = splitChunk(spaceLeft, chunk);

        chunk = chunk2;

        currentChunk = concat([currentChunk, chunk1]);
        chunkOrder += 1;

        encryptChunk(hardCopyArray(currentChunk), chunkOrder, key, fileId);

        currentChunk = new Uint8Array(0);
      }
    } while (chunk);
  }

  const encryptChunk = async (chunk, chunkOrder, key, fileId) => {
    const encryptedChunk = await symmetricEncrypt(chunk, key);
    uploadChunk(encryptedChunk, chunkOrder, fileId)
  }

  const uploadChunk = async (chunk, order, fileId) => {
    const blob = new Blob([chunk]);
    const formData = new FormData();
    formData.append('chunk', blob, filename);
    formData.append('order', new String(order));
    formData.append('uuid', fileId);

    // UPLOAD CHUNK 
    const uploadChunk = await fetch(CONSTANTS.BACKEND_URL + "/file/upload/chunk",
      {
        method: "POST",
        body: formData
      });
    const uploadChunkJson = await uploadChunk.json();
    finishedUploads.push(order);
  }

  const finishUpload = async (key, fileId) => {
    chunkOrder += 1;
    encryptChunk(currentChunk, chunkOrder, key, fileId);

    currentChunk = new Uint8Array(0);

    // WAIT UNTIL NO MORE CALLS ARE IN PROGRESS
    waitAndFinish(fileId, chunkOrder);
  }

  const waitAndFinish = async (fileId, chunkOrder) => {
    if (finishedUploads.length !== chunkOrder) {
      setTimeout(waitAndFinish, 100, fileId, chunkOrder);
    } else {
      // CREATE FILE UPLOAD FINISHED ENTRY
      const finalizeUpload = await fetch(CONSTANTS.BACKEND_URL + "/file/upload/finalize",
        {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({
            uuid: fileId,
            parts: chunkOrder,
            filename: filename
          })
        });

      chunkOrder = 0;

      alert("File upload finished");
      // REDIRECT TO DOWNLOAD PAGE
      navigate("/download", {replace: false})
    }
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
    const createFile = await fetch(CONSTANTS.BACKEND_URL + "/file/upload/create",
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          token: window.localStorage.getItem("token")
        })
      });
    const createFileJson = await createFile.json();
    const fileId = createFileJson.uuid;

    // STREAM FILE AND ENCRYPT IN CHUNKS
    // UPLOAD EACH CHUNK TO SERVER
    fileReader.read()
      .then(function processChunk({ done, value }) {
        if (done) {
          finishUpload(symmetricKey, fileId);
          return;
        }

        handleChunk(value, symmetricKey, fileId);
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
