import React from 'react';
import './App.css';
import {
  HashRouter as Router,
  Route
} from "react-router-dom";
import Home from "./views/home/index"
import Audience from "./views/audience/index"
function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/anchor" component={Home} exact></Route>
        <Route path="/audience" component={Audience}></Route>
      </Router>
    </div>
  );
}

export default App;
