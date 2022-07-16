import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import Upload from './components/Upload/Upload';
import Download from './components/Download/Download';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import { Outlet } from "react-router-dom";
import { useState } from 'react';

function App() {
  const [privateKey, setPrivateKey] = useState(null);

  return (
    <BrowserRouter>
    <div className='container'>
      <div className='innerContainer'>
          <Routes>
            <Route path='/' element={<Dashboard/>}/>
            <Route path='/upload' element={<Upload/>}/>
            <Route path='/download' element={<Download/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
          </Routes>
        <Outlet/>
      </div>
    </div>
    </BrowserRouter>
  );
}

export default App;
