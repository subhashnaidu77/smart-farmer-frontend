import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const styles = {
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column' },
    label: { marginBottom: '5px', fontSize: '14px', color: '#333' },
    input: { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' },
    button: { padding: '15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }
};

function EditProfile({ refreshUserData }) { // Receive the function as a prop
    const [profile, setProfile] = useState({ firstName: '', lastName: '', phone: '' });
    const [loading, setLoading] = useState(true);
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setProfile(userDocSnap.data());
                }
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
            await updateDoc(userDocRef, {
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone
            });
            await refreshUserData(); // Call the refresh function after successful update
            alert('Profile updated successfully!');
        } catch (error) {
            alert('Error updating profile: ' + error.message);
        }
    };

    if (loading) {
        return <p>Loading profile...</p>;
    }

    return (
        <div>
            <h2>Edit Profile</h2>
            <form style={styles.form} onSubmit={handleUpdateProfile}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>First Name</label>
                    <input style={styles.input} name="firstName" value={profile.firstName} onChange={handleInputChange} placeholder="Enter your first name" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Last Name</label>
                    <input style={styles.input} name="lastName" value={profile.lastName} onChange={handleInputChange} placeholder="Enter your last name" />
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input style={styles.input} name="phone" value={profile.phone} onChange={handleInputChange} placeholder="Enter your phone number" />
                </div>
                <button type="submit" style={styles.button}>Save Changes</button>
            </form>
        </div>
    );
}

export default EditProfile;