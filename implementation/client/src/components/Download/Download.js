import React from 'react';
import styles from './Download.module.css';
import FileManager from '../FileManager/FileManager';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons';

const Download = () => {
  const files = [
    ['file1.pdf', '44788bac-1f74-429b-8b73-631eff8b6763', '5233', 'ready', '07/07/2022'],
    ['file1.pdf', '44788bac-1f74-429b-8b73-631eff8b6763', '5233', 'ready', '07/07/2022'],
    ['file1.pdf', '44788bac-1f74-429b-8b73-631eff8b6763', '5233', 'uploading', '07/07/2022'],
    ['file1.pdf', '44788bac-1f74-429b-8b73-631eff8b6763', '5233', 'ready', '07/07/2022'],
    ['file1.pdf', '44788bac-1f74-429b-8b73-631eff8b6763', '5233', 'ready', '07/07/2022'],
    ['file1.pdf', '44788bac-1f74-429b-8b73-631eff8b6763', '5233', 'ready', '07/07/2022'],
    ['file1.pdf', '44788bac-1f74-429b-8b73-631eff8b6763', '5233', 'ready', '07/07/2022'],
  ];

  const handleRefreshClick = () => {
    console.log("refresh");
  }

  return <div className={styles.Download}>
    <div>
      <h3 className={styles.titleContainer}>Download files</h3>
      <FontAwesomeIcon icon={faRefresh} className={styles.cursorPointer} onClick={handleRefreshClick}/>
    </div>
    <FileManager files={files} />
  </div>
};

export default Download;
