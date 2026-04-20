import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CherryBlossomMap from './pages/CherryBlossomMap'
import LocalRestaurants from './pages/LocalRestaurants'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cherry-blossom" element={<CherryBlossomMap />} />
      <Route path="/local-restaurants" element={<LocalRestaurants />} />
    </Routes>
  )
}

export default App
