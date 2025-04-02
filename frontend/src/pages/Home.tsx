import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserService } from '../api/UserAPIEndpoint';
import { User } from '../models/UserModel';
import '../styles/Home.css'; // Import pliku CSS

const Home: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch all users
                const userData = await UserService.getUsers();
                setUsers(userData);

                // Get current user details if available
                if (userData.length > 0) {
                    setCurrentUser(userData[0]); // Set the first user as the current user
                }

                setError(null);
            } catch (err) {
                setError('Nie udało się pobrać danych. Spróbuj ponownie.');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">Ładowanie danych...</div>;
    }

    return (
        <div className="home-container">
            <h1>Panel zarządzania użytkownikami</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="dashboard">
                <div className="section user-management">
                    <h2>Zarządzanie użytkownikami</h2>
                    <div className="action-buttons">
                        <Link to="/users" className="action-button">
                            Lista użytkowników ({users.length})
                        </Link>
                        <Link to="/users/new" className="action-button">
                            Dodaj nowego użytkownika
                        </Link>
                    </div>
                </div>

                <div className="section current-user">
                    <h2>Twój profil</h2>
                    <div className="user-info">
                        {currentUser ? (
                            <>
                                <p><strong>Imię:</strong> {currentUser.first_name || 'Nie podano'}</p>
                                <p><strong>Nazwisko:</strong> {currentUser.last_name || 'Nie podano'}</p>
                                <p><strong>Email:</strong> {currentUser.email}</p>
                                <div className="user-actions">
                                    <Link to={`/users/${currentUser.id}`} className="user-action">
                                        Zobacz szczegóły
                                    </Link>
                                    <Link to={`/users/edit/${currentUser.id}`} className="user-action">
                                        Edytuj dane
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <p>Zaloguj się, aby zobaczyć swój profil</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="section recently-added">
                <h2>Ostatnio dodani użytkownicy</h2>
                <div className="recent-users">
                    {users.length > 0 ? (
                        users.slice(-3).map((user) => (
                            <div key={user.id} className="user-card">
                                <h3>{user.first_name || ''} {user.last_name || ''}</h3>
                                <p>{user.email}</p>
                                <div className="card-actions">
                                    <Link to={`/users/${user.id}`}>
                                        Zobacz szczegóły
                                    </Link>
                                    <Link to={`/users/edit/${user.id}`}>
                                        Edytuj
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Brak użytkowników w systemie.</p>
                    )}
                </div>
            </div>

            <div className="quick-actions">
                <h2>Szybkie akcje</h2>
                <div className="action-grid">
                    <Link to="/users" className="quick-action">
                        Lista użytkowników
                    </Link>
                    <Link to="/users/new" className="quick-action">
                        Dodaj użytkownika
                    </Link>
                    {/*{currentUser && (*/}
                    {/*    <>*/}
                    {/*        <Link to={`/users/${currentUser.id}`} className="quick-action">*/}
                    {/*            Mój profil*/}
                    {/*        </Link>*/}
                    {/*        <Link to={`/users/edit/${currentUser.id}`} className="quick-action">*/}
                    {/*            Edytuj profil*/}
                    {/*        </Link>*/}
                    {/*    </>*/}
                    {/*)}*/}
                </div>
            </div>
        </div>
    );
};

export default Home;
