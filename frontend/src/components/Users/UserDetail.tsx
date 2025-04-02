
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService } from '../../api/UserAPIEndpoint';
import { User } from '../../models/UserModel';
import '../../styles/UserDetail.css';

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = async () => {
        if (!id || id === 'new') return;

        try {
            setLoading(true);
            const userData = await UserService.getUser(parseInt(id));
            setUser(userData);
            setError(null);
        } catch (err) {
            setError('Nie udało się pobrać szczegółów użytkownika. Spróbuj ponownie.');
            console.error('Error fetching user:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [id]);

    const handleDelete = async () => {
        if (!user || !user.id) return;

        if (window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
            try {
                await UserService.deleteUser(user.id);
                navigate('/users');
            } catch (err) {
                setError('Nie udało się usunąć użytkownika. Spróbuj ponownie.');
                console.error('Error deleting user:', err);
            }
        }
    };

    if (loading) {
        return <div className="loading">Ładowanie szczegółów użytkownika...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!user) {
        return <div>Nie znaleziono użytkownika</div>;
    }

    return (
        <div className="user-detail-container">
            <h1>Szczegóły użytkownika</h1>

            <button onClick={() => navigate('/users')} className="back-button">
                Powrót do listy
            </button>

            <div className="user-details">
                <h2>{user.first_name} {user.last_name}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rola:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.is_active ? 'Aktywny' : 'Nieaktywny'}</p>

                {/* Additional user details can be added here */}

                <div className="actions">
                    <button onClick={fetchUser} className="refresh-button">
                        Odśwież
                    </button>
                    <button onClick={() => navigate(`/users/edit/${user.id}`)} className="edit-button">
                        Edytuj
                    </button>
                    <button onClick={handleDelete} className="delete-button">
                        Usuń
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;