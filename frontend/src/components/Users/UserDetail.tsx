import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserService } from "../../api/UserAPIEndpoint";
import { ProfileService } from "../../api/ProfileAPIEndpoint";
import { User } from "../../models/UserModel";
import { Profile } from "../../models/ProfileModel";
import "../../styles/UserDetail.css";

const UserDetail: React.FC = () => {
    const { id } = useParams<{ id?: string }>(); 
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [profileLoading, setProfileLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id || id === "new") return;

        const fetchUser = async () => {
            setLoading(true);
            try {
                const userData = await UserService.getUser(parseInt(id));
                setUser(userData);
                setError(null);
            } catch (err) {
                setError("Nie udało się pobrać szczegółów użytkownika.");
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const profileData = await ProfileService.getProfile(parseInt(id));
                setProfile(profileData);
            } catch (err) {
                console.warn("Brak profilu dla użytkownika.");
            } finally {
                setProfileLoading(false);
            }
        };

        fetchUser();
        fetchProfile();
    }, [id]);

    const handleDelete = async () => {
        if (!user?.id) return;
        if (window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
            try {
                await UserService.deleteUser(user.id);
                navigate("/users");
            } catch (err) {
                setError("Nie udało się usunąć użytkownika.");
                console.error("Error deleting user:", err);
            }
        }
    };

    if (loading) return <div className="loading">Ładowanie użytkownika...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!user) return <div>Nie znaleziono użytkownika</div>;

    return (
        <div className="user-detail-container">
            <h1>Szczegóły użytkownika</h1>

            <button onClick={() => navigate("/users")} className="back-button">
                Powrót do listy
            </button>

            <div className="user-details">
                <h2>{user.first_name} {user.last_name}</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rola:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.is_active ? "Aktywny" : "Nieaktywny"}</p>

                <div className="actions">
                    <button onClick={() => navigate(`/users/edit/${user.id}`)} className="edit-button">Edytuj</button>
                    <button onClick={handleDelete} className="delete-button">Usuń</button>
                </div>
            </div>

            <div className="user-profile-section">
                <h2>Profil użytkownika</h2>
                {profileLoading ? (
                    <p>Ładowanie profilu...</p>
                ) : profile ? (
                    <div className="profile-details">
                        <div className="detail-item">
                            <span>Adres:</span>
                            <p>{profile.address || "Nie podano"}</p>
                        </div>
                        <div className="detail-item">
                            <span>Telefon:</span>
                            <p>{profile.phone || "Nie podano"}</p>
                        </div>
                        <div className="detail-item">
                            <span>Preferowana metoda kontaktu:</span>
                            <p>
                                {profile.preferred_contact_method === "email" ? "Email" :
                                    profile.preferred_contact_method === "phone" ? "Telefon" :
                                        profile.preferred_contact_method || "Nie podano"}
                            </p>
                        </div>

                    </div>
                ) : (
                    <p>Brak dodatkowego profilu.</p>
                )}
            </div>

            <button onClick={() => navigate("/users")} className="back-button">
                Powrót do listy
            </button>
        </div>
    );
};

export default UserDetail;
