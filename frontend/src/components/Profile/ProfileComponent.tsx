import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../models/ProfileModel';
import { ProfileService } from '../../api/ProfileAPIEndpoint';
import '../../styles/Profile.css';

const ProfileComponent: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const userId = localStorage.getItem('userId');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<Profile>({
        id: '',
        address: '',
        phone: '',
        photo: '',
        preferred_contact_method: 'email'
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userID');
            const profileData = await ProfileService.getProfile(userId);
            setProfile(profileData);
            setFormData({
                id: profileData.id || '',
                user: profileData.user || '',
                address: profileData.address || '',
                phone: profileData.phone || '',
                photo: profileData.photo || '',
                preferred_contact_method: profileData.preferred_contact_method || 'email'
            });
            setError(null);
        } catch (err) {
            setError('Nie udało się pobrać danych profilu. Spróbuj ponownie.');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const userId = localStorage.getItem('userID');
            console.log(userId);
            let updatedProfile;
            if (profile) {
                updatedProfile = await ProfileService.updateProfile(userId,formData);
            } else {
                updatedProfile = await ProfileService.createProfile(formData);
            }

            setProfile(updatedProfile);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError('Nie udało się zapisać profilu. Spróbuj ponownie.');
            console.error('Error saving profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Czy na pewno chcesz usunąć swój profil?')) {
            return;
        }

        try {
            setLoading(true);
            await ProfileService.deleteProfile();
            setProfile(null);
            setFormData({
                id: '',
                address: '',
                phone: '',
                photo: '',
                preferred_contact_method: 'email'
            });
            setError(null);
        } catch (err) {
            setError('Nie udało się usunąć profilu. Spróbuj ponownie.');
            console.error('Error deleting profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Ładowanie danych profilu...</div>;
    }

    return (
        <div className="profile-container">
            <h1>{profile ? 'Twój Profil' : 'Utwórz Profil'}</h1>

            {error && <div className="error-message">{error}</div>}

            {profile && !isEditing ? (
                <div className="profile-details">
                    <div className="detail-item">
                        <span>Adres:</span>
                        <p>{profile.address || 'Nie podano'}</p>
                    </div>
                    <div className="detail-item">
                        <span>Telefon:</span>
                        <p>{profile.phone || 'Nie podano'}</p>
                    </div>
                    <div className="detail-item">
                        <span>Zdjęcie:</span>
                        {profile.photo ? (
                            <img src={profile.photo} alt="Profilowe" className="profile-photo" />
                        ) : (
                            <p>Nie dodano zdjęcia</p>
                        )}
                    </div>
                    <div className="detail-item">
                        <span>Preferowana metoda kontaktu:</span>
                        <p>{profile.preferred_contact_method === 'email' ? 'Email' :
                            profile.preferred_contact_method === 'phone' ? 'Telefon' :
                                'Nie podano'}
                        </p>
                    </div>

                    <div className="profile-actions">
                        <button className="edit-button" onClick={() => setIsEditing(true)}>Edytuj profil</button>
                        <button className="delete-button" onClick={handleDelete}>Usuń profil</button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="address">Adres:</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Wprowadź adres"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Telefon:</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Wprowadź numer telefonu"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="photo">Zdjęcie:</label>
                        <input
                            type="file"
                            id="photo"
                            name="photo"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setFormData(prev => ({ ...prev, photo: reader.result as string }));
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        {formData.photo && (
                            <img src={formData.photo} alt="Podgląd zdjęcia" className="preview-photo" />
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="preferred_contact_method">Preferowana metoda kontaktu:</label>
                        <select
                            id="preferred_contact_method"
                            name="preferred_contact_method"
                            value={formData.preferred_contact_method}
                            onChange={handleChange}
                        >
                            <option value="email">Email</option>
                            <option value="phone">Telefon</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button">
                            {profile ? 'Zapisz zmiany' : 'Utwórz profil'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        id: profile?.id || '',
                                        address: profile?.address || '',
                                        phone: profile?.phone || '',
                                        photo: profile?.photo || '',
                                        preferred_contact_method: profile?.preferred_contact_method || 'email'
                                    });
                                }}
                            >
                                Anuluj
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProfileComponent;
