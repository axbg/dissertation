import React, { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import DashboardTile from '../DashboardTile/DashboardTile';
const Dashboard = () => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("user");

  useEffect(() => {
    const loggedIn = window.localStorage.getItem("loggedIn");
    const user = window.localStorage.getItem("username");

    if (loggedIn) {
      setLoggedIn(true);
      setUsername(user);
    } else {
      setLoggedIn(false);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    window.localStorage.clear();
    window.location.reload();
  };

  return (
    <div className={styles.Dashboard}>
      <h2>Hello {username}!</h2>
      <h3>What would you like to do?</h3>

      {!isLoggedIn ?
        <div className={styles.flexContainer}>
          <DashboardTile name="Login" path="/login" />
          <DashboardTile name="Register" path="/register" />
        </div>
        :
        <div className={styles.flexContainer}>
          <DashboardTile name="Upload" path="/upload" />
          <DashboardTile name="Download" path="/download" />
        </div>}
        <br/>
        <br/>
        {isLoggedIn ? 
        <h4 onClick={handleLogout} className={styles.cursorPointer}>Logout?</h4>
        : <div></div>}
    </div>
  );
};

export default Dashboard;
