
import { React, useState } from "react";
import firepadRef, { db } from "./server/firebase";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import Meet from "./Meet";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function MainMenu() {
  return (
    <Router>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src="/favicon.ico" alt="" width="24" height="24" className="d-inline-block align-text-top" />
            Web-Conference
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/create">Create</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div>
        {/* A <Routes> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Routes>
          <Route path="/create" element={<Create />} />
          <Route path="/meet" element={<Meet />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  const [input, setInput] = useState(''); // '' is the initial state value
  let onSubmit = function (e) {
    // console.log(input)
    window.location.href = "/meet?id=" + input
  }
  return <div>
    <h2><u>Home</u></h2>
    <div>
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label htmlFor="exampleFormControlInput1" className="form-label">Masukkan ID Room</label>
            <input className="form-control" value={input} onInput={e => setInput(e.target.value)} />
          </div>
        </div>
      </div>
      <button type="button" onClick={onSubmit} className="btn btn-success">Join Room</button>
    </div>
  </div>;
}

function Create() {
  const [input, setInput] = useState(''); // '' is the initial state value
  let onSubmit = function (e) {
    // console.log(input, result)
    navigator.clipboard.writeText(`Topik = ${input}\x0DID Room = ${result}`);
    alert(`Data tersalin`);
  }
  var f = firepadRef;
  f = f.push();

  var result = f.key;
  // var result = window.location.host + "/meet?id=" + f.key;
  var wares = `whatsapp://send?text=Topik = ${input}\x0D\nID Room = ${result}`;
  // console.log(window.location.pathname)
  return <div>
    <h2><u>Create Room</u></h2>
    <div className="row">
      <div className="col-md-6">
        <div className="mb-3">
          <label htmlFor="exampleFormControlInput1" className="form-label">Topik</label>
          <input type="text" className="form-control" id="exampleFormControlInput1" placeholder="Topik" value={input} onInput={e => setInput(e.target.value)} />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleFormControlInput2" className="form-label">ID Room</label>
          <input type="text" className="form-control" id="exampleFormControlInput2" value={result} />
        </div>
      </div>
    </div>
    <br /><button onClick={onSubmit} className="btn btn-primary">Salin</button><span />
    <a className="btn btn-success" href={wares} data-action="share/whatsapp/share">Share via Whatsapp</a>
  </div>;
}

export default MainMenu;
