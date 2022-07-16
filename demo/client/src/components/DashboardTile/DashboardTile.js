import React, {useCallback} from 'react';
import styles from './DashboardTile.module.css';
import {useNavigate} from 'react-router-dom';

const DashboardTile = (props) => {
  const navigate = useNavigate();
  const handleOnClick = useCallback(() => navigate(props.path, {replace: false}), [navigate, props]);

  return (
  <div className={styles.DashboardTile}>
    <h1 onClick={handleOnClick}>{props.name}</h1>
  </div>);
};

export default DashboardTile;
