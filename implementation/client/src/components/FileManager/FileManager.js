import React from 'react';
import File from '../File/File';
import styles from './FileManager.module.css';

const FileManager = (props) => {
  return (<div>
    <File isHeader={true} showIcons={false} col1='Filename' col2='UUID' col3='Size' col4='Status' col5='Uploaded at' col6='Download' col7='Remove' />
    <div className={styles.FileManager}>
    {props.files.map((entry) => (
      <File key={entry.uuid} isHeader={false} refresh={props.refresh} showIcons={true} col1={entry.name} col2={entry.uuid} col3={entry.size} col4={entry.uploadedAt} col5={entry.status} col6='Download' col7='Remove' />
    ))}
    </div>
  </div>);
};

export default FileManager;
