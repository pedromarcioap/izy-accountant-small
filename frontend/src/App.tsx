import React from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>WebApp de Análise de Extratos</h1>
      </header>
      <main>
        <ImageUploader />
      </main>
    </div>
  );
}

export default App;
