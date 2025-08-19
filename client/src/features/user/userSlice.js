import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios.js';
import toast from 'react-hot-toast';

// initial state
const initialState = {
    value: null
};

// fetch current user data
export const fetchUser = createAsyncThunk('user/fetchUser', async (token) => {
    const { data } = await api.get('/api/user/data', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data.success ? data.user : null;
});

// update user data
export const updateUser = createAsyncThunk('user/update', async ({ userData, token }) => {
    try {
        const { data } = await api.post('/api/user/update', userData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (data.success) {
            toast.success(data.message); // only one toast
            return data.user; // updated user with new cover_photo
        } else {
            toast.error(data.message);
            return null;
        }
    } catch (error) {
        toast.error(error.message);
        return null;
    }
});

// user slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.value = action.payload;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.value = action.payload;
            });
    }
});
export default userSlice.reducer;
