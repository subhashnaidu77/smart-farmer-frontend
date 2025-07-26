import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Basic styles
const styles = {
    toggleContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '15px' },
    label: { fontSize: '16px' },
    // A simple CSS toggle switch
    switch: { position: 'relative', display: 'inline-block', width: '60px', height: '34px' },
    slider: { position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ccc', transition: '.4s', borderRadius: '34px' },
    sliderBefore: { position: 'absolute', content: '""', height: '26px', width: '26px', left: '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }
};

function NotificationsSettings() {
    const [prefs, setPrefs] = useState({ activity: true, investment: true, promotions: false });
    const currentUser = auth.currentUser;

    useEffect(() => {
        const fetchPrefs = async () => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().notificationPrefs) {
                    setPrefs(docSnap.data().notificationPrefs);
                }
            }
        };
        fetchPrefs();
    }, [currentUser]);

    const handlePrefChange = async (prefName) => {
        const newPrefs = { ...prefs, [prefName]: !prefs[prefName] };
        setPrefs(newPrefs);
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { notificationPrefs: newPrefs });
    };

    return (
        <div>
            <h2>Notifications</h2>
            <p>Choose what you want to be notified about.</p>
            
            <div style={styles.toggleContainer}>
                <label style={styles.label}>Account Activity</label>
                <label style={styles.switch}>
                    <input type="checkbox" checked={prefs.activity} onChange={() => handlePrefChange('activity')} />
                    <span style={{...styles.slider, backgroundColor: prefs.activity ? 'var(--accent-color)' : '#ccc'}}></span>
                </label>
            </div>
            <div style={styles.toggleContainer}>
                <label style={styles.label}>New Investments Available</label>
                 <label style={styles.switch}>
                    <input type="checkbox" checked={prefs.investment} onChange={() => handlePrefChange('investment')} />
                    <span style={{...styles.slider, backgroundColor: prefs.investment ? 'var(--accent-color)' : '#ccc'}}></span>
                </label>
            </div>
            <div style={styles.toggleContainer}>
                <label style={styles.label}>Promotions and Offers</label>
                 <label style={styles.switch}>
                    <input type="checkbox" checked={prefs.promotions} onChange={() => handlePrefChange('promotions')} />
                    <span style={{...styles.slider, backgroundColor: prefs.promotions ? 'var(--accent-color)' : '#ccc'}}></span>
                </label>
            </div>
        </div>
    );
}

export default NotificationsSettings;