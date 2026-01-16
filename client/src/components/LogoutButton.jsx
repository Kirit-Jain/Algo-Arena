import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        navigate('/login');
    };

    return (
        <button
            onClick={handleLogout}
            style={{backgroundColor: '#d32f2f', color: 'white', border: '1px solid #ff5252', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', marginLeft: '15px', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '14px'}}
            onMouseOver={(e) => e.target.style.backgroundColor = '#b71c1c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#d32f2f'}
        >
            LOGOUT
        </button>
    );
};

export default LogoutButton;