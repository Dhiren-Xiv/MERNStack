import axios from 'axios';
import { setAlert } from "./alert";

import { GET_PROFILE, PROFILE_ERROR, UPDATE_PROFILE, DELETE_ACCOUNT, CLEAR_PROFILE } from './types';

// Get current user profile.

export const getCurrentProfile = () => async dispatch => {
    try {
        const res = await axios.get('/api/profile/me');
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        })
    } catch (error) {
        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: error.response.statusText, status: error.response.status }
        })
    }
}

// Create or update profile
export const createProfile = (
    formData,
    history,
    edit = false
) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        console.log("config => ", config);
        const res = await axios.post('/api/profile', formData, config);
        console.log("res => ", res)
        dispatch({
            type: GET_PROFILE,
            payload: res.data
        });

        dispatch(setAlert(edit ? 'Profile Updated' : 'Profile Created', 'success'));

        if (!edit) {
            history.push('/dashboard');
        }
    } catch (err) {
        const errors = err.response.data.errors;
        console.log(errors);
        if (errors) {
            errors.forEach(error => {
                console.log(error.msg);
                return dispatch(setAlert(error.msg, 'danger'))
            });
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
};

// add experience.
export const addExperience = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const res = await axios.put('/api/profile/experience', formData, config);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Experience Added', 'success'));
        history.push('/dashboard');
    } catch (err) {
        const errors = err.response.data.errors;
        console.log(errors);
        if (errors) {
            errors.forEach(error => {
                console.log(error.msg);
                return dispatch(setAlert(error.msg, 'danger'))
            });
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
}

// add experience.
export const addEducation = (formData, history) => async dispatch => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const res = await axios.put('/api/profile/education', formData, config);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Education  Added', 'success'));
        history.push('/dashboard');
    } catch (err) {
        const errors = err.response.data.errors;
        console.log(errors);
        if (errors) {
            errors.forEach(error => {
                console.log(error.msg);
                return dispatch(setAlert(error.msg, 'danger'))
            });
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
}

// delete experince.
export const deleteExperience = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/experience/${id}`);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Experience Removed', 'success'));
    } catch (err) {
        const errors = err.response.data.errors;
        console.log(errors);
        if (errors) {
            errors.forEach(error => {
                console.log(error.msg);
                return dispatch(setAlert(error.msg, 'danger'))
            });
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
}

// delete Education.
export const deleteEducation = id => async dispatch => {
    try {
        const res = await axios.delete(`/api/profile/education/${id}`);
        dispatch({
            type: UPDATE_PROFILE,
            payload: res.data
        });
        dispatch(setAlert('Education Removed', 'success'));
    } catch (err) {
        const errors = err.response.data.errors;
        console.log(errors);
        if (errors) {
            errors.forEach(error => {
                console.log(error.msg);
                return dispatch(setAlert(error.msg, 'danger'))
            });
        }

        dispatch({
            type: PROFILE_ERROR,
            payload: { msg: err.response.statusText, status: err.response.status }
        });
    }
}

// Delete Account.
export const deleteAccount = () => async dispatch => {
    if (window.confirm("Are you sure? This cannot be undone")) {
        try {
            const res = await axios.delete('/api/profile');
            dispatch({
                type: CLEAR_PROFILE,
            });
            dispatch({ type: DELETE_ACCOUNT })
            dispatch(setAlert('Your acount has been permanently deleted'));
        } catch (err) {
            const errors = err.response.data.errors;
            console.log(errors);
            if (errors) {
                errors.forEach(error => {
                    console.log(error.msg);
                    return dispatch(setAlert(error.msg, 'danger'))
                });
            }

            dispatch({
                type: PROFILE_ERROR,
                payload: { msg: err.response.statusText, status: err.response.status }
            });
        }
    }
} 