import React from 'react';
import styles from './File.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { CONSTANTS } from '../../shared/constants';

const File = (props) => {
  const handleFileDownload = () => {
    console.log("yes");
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

    if(removeFileJson) {
      props.refresh();
    } else {
      alert("An error popped up");
    }
  }

  const isReady = () => {
    return props.col5 === 'UPLOADED';
  }

  return (
    <div className={`${styles.File} ${props.isHeader ? styles.isHeader : styles.isRow}`}>
      <div className={styles.flexChild}>
        <FontAwesomeIcon icon={faFile} className={props.showIcons ? styles.icon : styles.hidden} />
        <span>{props.col1}</span>
      </div>
      <div className={styles.flexChild}>
        <span>{props.col2}</span>
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
