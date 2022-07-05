import React from 'react';
import File from '../File/File';
import styles from './FileManager.module.css';

const FileManager = (props) => {
  return (<div>
    <File isHeader={true} showIcons={false} col1='Filename' col2='UUID' col3='Size' col4='Uploaded at' col5='Download' col6='Remove' />
    <div className={styles.FileManager}>
    {props.files.map((row, index) => (
      <File key={index} isHeader={false} showIcons={true} col1={row[0]} col2={row[1]} col3={row[2]} col4={row[3]} col5='Download' col6='Remove' />
    ))}
    </div>
  </div>);
};

export default FileManager;
