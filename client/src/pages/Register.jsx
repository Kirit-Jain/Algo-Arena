import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password,
            });

            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };


    return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#1e1e1e', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', color: '#ccc' }}>
      
      <div style={{ backgroundColor: '#2d2d2d', padding: '40px', borderRadius: '8px', width: '400px', border: '1px solid #444', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>Create Profile_</h2>
        
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>CODENAME</label>
            <input
              type="text"
              style={{ width: '100%', padding: '12px', backgroundColor: '#1e1e1e', border: '1px solid #444', color: 'white', borderRadius: '4px', outline: 'none', fontSize: '16px' }}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>EMAIL</label>
            <input
              type="email"
              style={{ width: '100%', padding: '12px', backgroundColor: '#1e1e1e', border: '1px solid #444', color: 'white', borderRadius: '4px', outline: 'none', fontSize: '16px' }}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>PASSWORD</label>
            <input
              type="password"
              style={{ width: '100%', padding: '12px', backgroundColor: '#1e1e1e', border: '1px solid #444', color: 'white', borderRadius: '4px', outline: 'none', fontSize: '16px' }}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            JOIN ARENA
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
          Already Operational? <Link to="/login" style={{ color: '#4caf50', textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;