import React, {useCallback, useState} from 'react';
import styles from './Upload.module.css';

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
    const file = await fileHandle.getFile();
    const fileStream = await file.stream();
    const fileReader = await fileStream.getReader();

    fileReader.read()
    .then(({done, value}) => console.log(value));

  }), [fileHandle]);

  const encryptChunk = (chunk) => {
    console.log("chunk");
    console.log("encrypting");
  };
  
  return (
  <div className={styles.Upload}>
    <button onClick={handleOnSelectFileButtonClick}>Select file</button>
    <p>Selected file: {filename}</p>
    <button onClick={handleOnUploadButtonClick}>Upload</button>
  </div>
  );
};

export default Upload;
