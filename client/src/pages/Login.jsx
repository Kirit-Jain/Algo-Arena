import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async(e) => {
        e.preventDefault();
        setError(false);

        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("userId", res.data._id);
            localStorage.setItem("username", res.data.username);

            navigate('/');
        } catch (error) {
            console.error(error);
            setError(true);
        }
    };

    return (
        <div style={{ height: '100vh', width: '100vw', backgroundColor: '#1e1e1e', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', color: '#ccc' }}>
            <div style={{ backgroundColor: '#2d2d2d', padding: '40px', borderRadius: '8px', width: '400px', border: '1px solid #444', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
                    Algo Arena Login ⚔️
                </h2>

                <form onSubmit={handleLogin} className='flex flex-col gap-4'>
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
                        style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
                    >
                        AUTHENTICATE
                    </button>

                    {error && <p style={{ color: '#f44336', marginTop: '15px', textAlign: 'center' }}>Access Denied: Invalid Credentials</p>}                
                </form>

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
                    New User? <Link to="/register" style={{ color: '#4caf50', textDecoration: 'none' }}>Initialize Protocol</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
