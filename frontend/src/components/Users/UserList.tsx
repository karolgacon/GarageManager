
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserService } from '../../api/UserAPIEndpoint';
import { User } from '../../models/UserModel';
import '../../styles/UserList.css';


const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await UserService.getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Nie udało się pobrać listy użytkowników. Spróbuj ponownie.');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="user-list-container">
            <h1>Lista użytkowników</h1>

            <div className="actions">
                <button
                    onClick={fetchUsers}
                    className="refresh-button"
                    disabled={loading}
                >
                    {loading ? 'Odświeżanie...' : 'Odśwież listę'}
                </button>
                <Link to="/users/new" className="create-button">
                    Dodaj nowego użytkownika
                </Link>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Ładowanie użytkowników...</div>
            ) : (
                <div className="user-grid">
                    {users.length > 0 ? (
                        users.map((user) => (
                            <div key={user.id} className="user-card">
                                <h3>{user.first_name} {user.last_name}</h3>
                                <p>{user.email}</p>
                                <p>Rola: {user.role}</p>
                                <p>Status: {user.is_active ? 'Aktywny' : 'Nieaktywny'}</p>
                                <Link to={`/users/${user.id}`}>Zobacz szczegóły</Link>
                            </div>
                        ))
                    ) : (
                        <p>Nie znaleziono użytkowników.</p>
                    )}
                </div>
            )}
            <button onClick={() => navigate('/')} className="back-button">
                Powrót do strony głównej
            </button>

        </div>
    );
};

export default UserList;