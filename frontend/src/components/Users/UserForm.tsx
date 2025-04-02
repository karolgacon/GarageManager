import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService } from '../../api/UserAPIEndpoint';
import { User } from '../../models/UserModel';
import '../../styles/UserForm.css';

interface UserFormProps {
    mode?: 'create' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({ mode = 'create' }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState<Partial<User>>({
        username: '',
        email: '',
        role: 'client',
        first_name: '',
        last_name: '',
        status: 'active',
        is_active: true,
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (mode === 'edit' && id) {
                try {
                    setLoading(true);
                    const userData = await UserService.getUser(parseInt(id));
                    setFormData(userData); // Ustawiamy dane użytkownika bez profilu
                } catch (err) {
                    setError('Nie udało się pobrać danych użytkownika');
                    console.error('Error fetching user:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUser();
    }, [id, mode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let createdUser = formData;

            if (mode === 'create') {
                // Tworzenie użytkownika
                const newUser = await UserService.createUser(formData);
                navigate('/users');
            } else if (mode === 'edit' && id) {
                await UserService.updateUser(parseInt(id), formData);
                navigate(`/users/${id}`);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'Nie udało się zapisać użytkownika.';
            setError(errorMsg);
            console.error('Error saving user:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="user-form-container">
            <h1>{mode === 'create' ? 'Dodaj nowego użytkownika' : 'Edytuj użytkownika'}</h1>

            <button onClick={() => navigate('/users')} className="back-button">
                Powrót do listy
            </button>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Ładowanie danych użytkownika...</div>
            ) : (
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="first_name">Imię</label>
                        <input type="text" id="first_name" name="first_name" value={formData.first_name || ''} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="last_name">Nazwisko</label>
                        <input type="text" id="last_name" name="last_name" value={formData.last_name || ''} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input type="text" id="username" name="username" value={formData.username || ''} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="active">Aktywny</option>
                            <option value="inactive">Nieaktywny</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button" disabled={submitting}>
                            {submitting ? 'Zapisywanie...' : 'Zapisz'}
                        </button>
                        <button type="button" onClick={() => navigate('/users')} className="cancel-button">
                            Anuluj
                        </button>
                    </div>
                </form>
            )}
            <button onClick={() => navigate('/users')} className="back-button">
                Powrót do listy
            </button>

        </div>
    );
};

export default UserForm;
