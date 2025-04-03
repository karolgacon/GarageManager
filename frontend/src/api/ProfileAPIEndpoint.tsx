import api from '../api';
import { Profile } from '../models/ProfileModel';

export const ProfileService = {
    getProfile: async (userId: number): Promise<Profile> => {
        const response = await api.get(`/profiles/${userId}/`);
        return response.data;
    },

    createProfile: async (profileData: Partial<Profile>): Promise<Profile> => {
        const response = await api.post('/profiles/', profileData);
        return response.data;
    },

    updateProfile: async (userId: number, profileData: Partial<Profile>): Promise<Profile> => {
        const response = await api.put(`/profiles/${userId}/`, profileData);
        return response.data;
    },

    deleteProfile: async (userId: number): Promise<void> => {
        await api.delete(`/profiles/${userId}/`);
    }
};
