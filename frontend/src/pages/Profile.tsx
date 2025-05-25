import React from 'react';
import MainLayout from '../components/Mainlayout/Mainlayout';
import ProfileComponent from '../components/Profile/ProfileComponent';

const Profile: React.FC = () => {
    return (
        <MainLayout>
            <ProfileComponent />
        </MainLayout>
    );
};

export default Profile;