import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Homepage, Restaurantpage, SearchPage } from './pages';
import { Header } from './components';

const App = () => {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/restaurant/:restaurantId' element={<Restaurantpage />} />
        <Route path='/search' element={<SearchPage />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
