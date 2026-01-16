import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/HomePage';
import GamePage from './pages/GamePage';
import ProtectedRoute from './components/ProtectedRoutes';
import Leaderboard from './pages/Leaderboard';
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/leaderboard' element={<Leaderboard />} />

        <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path='/game/:roomId' element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App;