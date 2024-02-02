import React from 'react';
import './App.scss';
import Header from './components/Header';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import WordOfTheDay from "./components/pages/WordOfTheDay";
import Adverts from "./components/Adverts";
import Home from "./components/pages/Home";

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
                            <Home />
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
                            <AdvancedSearch />
                        </div>
                        <div className="footer">
                        </div>
                    </div>
                } />
                <Route path="/word-of-the-day" element={
                    <div className="app">
                        <div className="header">
                            <Header/>
                        </div>
                        <div className="ads">
                            <Adverts/>
                        </div>
                        <div className="content">
                            <WordOfTheDay/>
                        </div>
                        <div className="footer">
                        </div>
                    </div>
                }/>
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
