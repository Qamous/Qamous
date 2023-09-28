import React from 'react';
import './App.css';
import Header from './components/Header';
import { BrowserRouter, Route, Routes } from "react-router-dom";

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={
                    <div className="app">
                        <div className="header">
                            <Header />
                        </div>
                        <div className="content">
                            {/* Your page content goes here */}
                        </div>
                        <div className="footer">
                        </div>
                    </div>
                } />
                <Route path="/advanced-search" element={
                    <div className="app">
                        <div className="header">
                            <Header />
                        </div>
                        <div className="content">
                            {/* Your page content goes here */}
                        </div>
                        <div className="footer">
                        </div>
                    </div>
                } />
                <Route path="/word-of-the-day" element={
                    <div className="app">
                        <div className="header">
                            <Header />
                        </div>
                        <div className="content">
                            {/* Your page content goes here */}
                        </div>
                        <div className="footer">
                        </div>
                    </div>
                } />
                <Route path="/advertise" element={
                    <div className="app">
                        <div className="header">
                            <Header />
                        </div>
                        <div className="content">
                            {/* Your page content goes here */}
                        </div>
                        <div className="footer">
                        </div>
                    </div>
                } />
                <Route path="/add-definition" element={
                    <div className="app">
                        <div className="header">
                            <Header />
                        </div>
                        <div className="content">
                            {/* Your page content goes here */}
                        </div>
                        <div className="footer">
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
