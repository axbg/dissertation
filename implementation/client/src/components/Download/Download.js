import React from 'react';
import styles from './Download.module.css';
import FileManager from '../FileManager/FileManager';

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

  return <div className={styles.Download}>
    <h3>Download files</h3>
    <FileManager files={files} />
  </div>
};

export default Download;
