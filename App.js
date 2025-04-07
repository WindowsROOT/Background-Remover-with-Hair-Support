import React from 'react';
import BackgroundRemover from './components/BackgroundRemover';
import './App.css';

function App() {
  return (
    <div className="App min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">ระบบลบพื้นหลังภาพรองรับเส้นผม</h1>
        <BackgroundRemover />
      </div>
    </div>
  );
}

export default App;
