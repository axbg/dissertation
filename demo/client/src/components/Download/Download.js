import React, { useEffect, useState } from 'react';
import styles from './Download.module.css';
import FileManager from '../FileManager/FileManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh, faRemove } from '@fortawesome/free-solid-svg-icons';
import { CONSTANTS } from '../../shared/constants';

const Download = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleRefreshClick = () => {
    fetchFiles();
  }

  const fetchFiles = async () => {
    const getFiles = await fetch(CONSTANTS.BACKEND_URL + "/file/",
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          token: window.localStorage.getItem("token")
        })
      });
    const getFilesJson = await getFiles.json();

    setFiles(getFilesJson);
  }

  const handleRemoveAllClick = async () => {
    if (window.confirm("Are you sure you want to delete all files?")) {
      await fetch(CONSTANTS.BACKEND_URL + "/file/remove/all",
        {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({
            token: window.localStorage.getItem("token")
          })
        });

      fetchFiles();
    }
  }

  return <div className={styles.Download}>
    <div>
      <h3 className={styles.titleContainer}>Download files</h3>
      <FontAwesomeIcon icon={faRefresh} className={styles.cursorPointer} onClick={handleRefreshClick} />
      <FontAwesomeIcon icon={faRemove} className={styles.cursorPointer} onClick={handleRemoveAllClick} />
    </div>
    <FileManager files={files} refresh={fetchFiles} />
  </div>
};

export default Download;
