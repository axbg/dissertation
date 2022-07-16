import React from 'react';
import styles from './File.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { CONSTANTS } from '../../shared/constants';
import { base64ToArrayBuffer, decryptWithPrivateKey, generateSymmetricKey, exportSymmetricKey, importSymmetricKey, symmetricDecrypt } from '../../shared/crypto';
import { concat } from 'uint8arrays/concat';
import { splitChunk, hardCopyArray } from '../../shared/utils';

const File = (props) => {
  const CHUNK_SIZE = 1000016;

  let currentChunk = new Uint8Array(0);

  const handleChunk = (chunk, key, writableStream) => {
    do {
      if ((currentChunk.length + chunk.length) <= CHUNK_SIZE) {
        currentChunk = concat([currentChunk, chunk]);
        chunk = null;
      } else {
        const spaceLeft = CHUNK_SIZE - currentChunk.length;
        const [chunk1, chunk2] = splitChunk(spaceLeft, chunk);

        chunk = chunk2;

        currentChunk = concat([currentChunk, chunk1]);

        decryptChunk(hardCopyArray(currentChunk), key, writableStream);

        currentChunk = new Uint8Array(0);
      }
    } while (chunk);
  }

  const decryptChunk = async (chunk, symmetricKey, writableStream) => {
    try{
      storeChunk(await symmetricDecrypt(chunk, symmetricKey), writableStream);
    } catch(e) {
    }
  }

  const storeChunk = async (chunk, writableStream) => {
    writableStream.write(chunk);
  }

  const finishDownload = async (symmetricKey, writableStream) => {
    await decryptChunk(currentChunk, symmetricKey, writableStream);
    await writableStream.close();

    currentChunk = new Uint8Array(0);

    alert("Download finished");
  }

  const downloadFile = async (symmetricKey, writableStream) => {
    // GET THE FILE CHUNKS AND DECRYPT EACH ONE
    const downloadFile = await fetch(CONSTANTS.BACKEND_URL + "/file/download", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        token: window.localStorage.getItem("token"),
        uuid: props.col2
      })
    })
    const readableStream = await downloadFile.body;
    const fileReader = readableStream.getReader();

    fileReader.read()
      .then(async function processChunk({ done, value }) {
        if (done) {
          finishDownload(symmetricKey, writableStream);
          return;
        }

        handleChunk(value, symmetricKey, writableStream);
        return fileReader.read().then(processChunk);
      });
  }

  const handleFileDownload = async () => {
    // GET FILE ENCRYPTED SYMMETRIC KEY
    const getFileKey = await fetch(CONSTANTS.BACKEND_URL + "/file/key",
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          token: window.localStorage.getItem("token"),
          uuid: props.col2
        })
      });
    const getFileKeyJson = await getFileKey.json();

    // DECRYPT THE KEY WITH THE PRIVATE KEY
    const encryptedEncodedKey = getFileKeyJson.key;
    const encryptedKey = base64ToArrayBuffer(encryptedEncodedKey);
    const decryptedKey = await decryptWithPrivateKey(window.localStorage.getItem("privateKey"), encryptedKey);
    const symmetricKey = await importSymmetricKey(decryptedKey);

    // ASK USER TO SELECT A FILE
    const fileHandle = await window.showSaveFilePicker();
    const writableStream = await fileHandle.createWritable({ keepExistingData: false });

    downloadFile(symmetricKey, writableStream);
  }

  const handleFileDelete = async () => {
    const removeFile = await fetch(CONSTANTS.BACKEND_URL + "/file/remove",
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          token: window.localStorage.getItem("token"),
          uuid: props.col2
        })
      });
    const removeFileJson = await removeFile.json();

    if (removeFileJson) {
      props.refresh();
    } else {
      alert("An error popped up");
    }
  }

  const isReady = () => {
    return props.col5 === 'READY';
  }

  return (
    <div className={`${styles.File} ${props.isHeader ? styles.isHeader : styles.isRow}`}>
      <div className={styles.flexChild}>
        <FontAwesomeIcon icon={faFile} className={props.showIcons ? styles.icon : styles.hidden} />
        <span>{props.col1}</span>
      </div>
      <div className={styles.flexChild}>
        <span>{props.col3}</span>
      </div>
      <div className={styles.flexChild}>
        <span>{props.col4}</span>
      </div>
      <div className={styles.flexChild}>
        <span>{props.col5}</span>
      </div>
      <div className={styles.flexChild}>
        {props.isHeader ? <span>{props.col6}</span>
          : isReady() ? <span onClick={handleFileDownload} className={styles.cursorPointer}>{props.col6}</span>
            : <span className={styles.disabled}>{props.col6}</span>}
      </div>
      <div className={styles.flexChild}>
        {props.isHeader ? <span>{props.col7}</span>
          : isReady() ? <span onClick={handleFileDelete} className={styles.cursorPointer}>{props.col7}</span>
            : <span className={styles.disabled}>{props.col7}</span>}
      </div>
    </div>);
};

export default File;
