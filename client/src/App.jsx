import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Homepage, Restaurantpage, SearchPage } from './pages';
import { Header } from './components';
import ImageUploadPage from './pages/ImageUploadPage';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/restaurant/:restaurantId' element={<Restaurantpage />} />
        <Route path='/search' element={<SearchPage />}/>
        <Route path='/image-upload' element={<ImageUploadPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
