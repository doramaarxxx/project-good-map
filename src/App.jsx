import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CherryBlossomMap from './pages/CherryBlossomMap'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cherry-blossom" element={<CherryBlossomMap />} />
    </Routes>
  )
}

export default App
