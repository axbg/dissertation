import React, {useState} from 'react';
import styles from './Login.module.css';
import { decryptPrivateKey } from '../../shared/crypto';
import {useNavigate} from 'react-router-dom';
import { CONSTANTS } from '../../shared/constants';
import { base64ToArrayBuffer, decryptWithPrivateKey, ab2str } from '../../shared/crypto';
 

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
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

  const handleMasterPasswordUpdate = (input) => {
    if(!!input && !!input.target && !!input.target.value && input.target.value !== "") {
      setMasterPassword(input.target.value);
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
      const decPrivateKey = await decryptPrivateKey(encryptedPrivate, masterPassword);

      // EXECUTE LOGIN PROCEDURE
      const loginAttempt = await fetch(CONSTANTS.BACKEND_URL + "/user/login/initialize", 
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          username: username, 
          password: password
        })
      });
      const loginAttemptJson = await loginAttempt.json();

      const undecodedEncryptedSecret = base64ToArrayBuffer(loginAttemptJson.secret);

      // DECRYPT THE SECRET
      const secret = ab2str(await decryptWithPrivateKey(decPrivateKey, undecodedEncryptedSecret));
      
      const loginFinalizeAttempt = await fetch(CONSTANTS.BACKEND_URL + "/user/login/finalize", 
      {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          username: username, 
          password: password,
          secret: secret
        })
      });
      const loginFinalizeAttemptJson = await loginFinalizeAttempt.json();

      // STORE DATA
      window.localStorage.setItem("loggedIn", true);
      window.localStorage.setItem("username", username);
      window.localStorage.setItem("token", loginFinalizeAttemptJson.secret);
      window.localStorage.setItem("privateKey", decPrivateKey);
      window.localStorage.setItem("publicKey", loginFinalizeAttemptJson.publicKey);

      // REDIRECT TO DASHBOARD
      navigate("/", {replace: true});
  }

  return <div className={styles.Login}>
      <p>Insert your username</p>
      <input type="text" placeholder='username' value={username} onChange={handleUsernameUpdate}></input>
      <br/>
      <br/>
      <p>Insert your account password</p>
      <input type="password" placeholder='password' value={password} onChange={handlePasswordUpdate}></input>
      <br/>
      <br/>
      <p>Insert your master password (the one generated on the register step)</p>
      <input type="password" placeholder='masterPassword' value={masterPassword} onChange={handleMasterPasswordUpdate}></input>
      <br/>
      <br/>
      <br/>
      <input type="file" id="privKey" className={styles.hidden} onChange={handleFileUpload}></input>
      <label htmlFor="privKey" className={styles.uploadLabel}>Click to select your encrypted private key</label>
      <br/>
      <br/>
      <br/>
      <button onClick={handleSubmit}>Login</button>
  </div>
};

export default Login;
