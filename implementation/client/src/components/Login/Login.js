import React, {useState} from 'react';
import styles from './Login.module.css';
import { decryptPrivateKey } from '../../shared/crypto';
import {useNavigate} from 'react-router-dom';


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [encryptedPrivate, setEncryptedPrivate] = useState(null);
  const navigate = useNavigate();

  const handleUsernameUpdate = (input) => {
    if(!!input && !!input.target && !!input.target.value && input.target.value !== "") {
      setUsername(input.target.value);
    }
  }

  const handlePasswordUpdate = (input) => {
    if(!!input && !!input.target && !!input.target.value && input.target.value !== "") {
      setPassword(input.target.value);
    }
  }

  const handleFileUpload = (file) => {
    const actualFile = file.target.files[0];
    const reader = new FileReader();

    reader.readAsArrayBuffer(actualFile);
    reader.onloadend = (evt) => {
      if (evt.target.readyState === FileReader.DONE) {
        const arrayBuffer = evt.target.result,
        array = new Uint8Array(arrayBuffer);
        setEncryptedPrivate(array);
      }
    }
  }

  const handleSubmit = async () => {
      // DECRYPT PRIVATE KEY
      const decPrivateKey = await decryptPrivateKey(encryptedPrivate, password);

      // EXECUTE LOGIN PROCEDURE
      // STORE PUBLIC KEY 

      // STORE DATA
      window.localStorage.setItem("loggedIn", true);
      window.localStorage.setItem("username", username);
      window.localStorage.setItem("privateKey", decPrivateKey);

      // REDIRECT TO DASHBOARD
      navigate("/", {replace: true});
  }

  return <div className={styles.Login}>
      <p>Insert your username</p>
      <input type="text" placeholder='username' value={username} onChange={handleUsernameUpdate}></input>
      <br/>
      <br/>
      <p>Insert your master password</p>
      <input type="text" placeholder='password' value={password} onChange={handlePasswordUpdate}></input>
      <br/>
      <br/>
      <br/>
      <input type="file" id="privKey" className={styles.hidden} onChange={handleFileUpload}></input>
      <label htmlFor="privKey">Click to select your encrypted private key</label>
      <br/>
      <br/>
      <br/>
      <button onClick={handleSubmit}>Login</button>
  </div>
};

export default Login;
