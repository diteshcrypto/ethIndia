import React, { Component } from "react";

import Layout from "./components/Layout/Layout";
import 'semantic-ui-css/semantic.min.css';


import "./App.css";

class App extends Component {
    render() {
        return (
            <div className="App">
                <Layout />
            </div>
        );
    }
}

export default App;
