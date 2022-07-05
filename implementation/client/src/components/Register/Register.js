import React,  {useState} from 'react';
import styles from './Register.module.css';
import { generateRSAKeyPair, generateSecurePassword } from '../../shared/crypto';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleUsernameUpdate = (input) => {
    if(!!input && !!input.target && !!input.target.value && input.target.value !== "") {
      setUsername(input.target.value);
    }
  }

  const handleSubmit = async () => {
    // GENERATE MASTER PASSWORD
    const privateKeyPassword = generateSecurePassword();

    // GENERATE RSA KEY
    // ENCRYPT PRIVATE KEY
    const [privateKey, publicKey] = await generateRSAKeyPair(privateKeyPassword);

    // TODO POST REQUEST TO BACK-END WITH PUBLIC KEY

    // DOWNLOAD PRIVATE KEY
    alert("Select where to store the asymmetric private key");
    const privFileHandle = await window.showSaveFilePicker();
    const privWritableStream = await privFileHandle.createWritable({keepExistingData: false});
    await privWritableStream.write(privateKey);
    await privWritableStream.close();

    alert("Select where to store the master password that you will need to remember in order to decrypt the private key");
    const passFileHandle = await window.showSaveFilePicker();
    const passWritableStream = await passFileHandle.createWritable({keepExistingData: false});
    await passWritableStream.write(privateKeyPassword);
    await passWritableStream.close();
    
    // REDIRECT TO DASHBOARD
    alert("You can login now");
    navigate("/", {replace: true});
  }

  return <div className={styles.Login}>
      <p>Choose a username</p>
      <input type="text" placeholder='username' value={username} onChange={handleUsernameUpdate}></input>
      <br/>
      <br/>
      <button onClick={handleSubmit}>Register</button>
  </div>
};

export default Register;
