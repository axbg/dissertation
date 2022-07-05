import React, {useCallback, useState} from 'react';
import styles from './Upload.module.css';
import { generateSecurePassword } from '../../shared/crypto';

const Upload = () => {
  // 1MB
  const chunkSize = 1000000;
  const [fileHandle, setFileHandle] = useState(null);
  const [filename, setFilename] = useState("No file was selected");

  const handleOnSelectFileButtonClick = useCallback(( async () => {
      const openFileHandler = await window.showOpenFilePicker();

      if(openFileHandler[0].kind === 'file') {
        setFileHandle(openFileHandler[0]);
        setFilename(openFileHandler[0].name);
      }
    }), []);

  const handleOnUploadButtonClick = useCallback((async() => {
    // GENERATE PASSWORD
    const password = generateSecurePassword();

    // INIT FILE HANDLING
    const file = await fileHandle.getFile();
    const fileStream = await file.stream();
    const fileReader = await fileStream.getReader();

    // STREAM FILE AND ENCRYPT IN CHUNKS
    // UPLOAD EACH CHUNK TO SERVER
    fileReader.read().then(({done, value}) => console.log(value));

    // ENCRYPT GENERATED PASSWORD WITH PUBLIC KEY

    // 
  
  }), [fileHandle]);

  return (
  <div className={styles.Upload}>
    <label className={styles.uploadLabel} onClick={handleOnSelectFileButtonClick}>Click to select a file for upload</label>
    <br/>
    <br/>
    <p>Selected file: {filename}</p>
    <br/>
    <button onClick={handleOnUploadButtonClick}>Upload</button>
  </div>
  );
};

export default Upload;
