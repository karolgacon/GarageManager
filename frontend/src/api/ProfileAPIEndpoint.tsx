import api from '../api';
import { Profile } from '../models/ProfileModel';

export const ProfileService = {
    getProfile: async (): Promise<Profile> => {
        const response = await api.get('/profile/');
        return response.data;
    },

    createProfile: async (profileData: Partial<Profile>): Promise<Profile> => {
        const response = await api.post('/profile/', profileData);
        return response.data;
    },

    updateProfile: async (profileData: Partial<Profile>): Promise<Profile> => {
        const response = await api.put('/profile/', profileData);
        return response.data;
    },

    deleteProfile: async (): Promise<void> => {
        await api.delete('/profile/');
    }
};