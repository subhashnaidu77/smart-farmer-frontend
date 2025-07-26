import React from 'react';
import { useTheme } from '../context/ThemeContext';

const styles = {
    container: {},
    settingItem: { marginBottom: '25px' },
    label: { display: 'block', marginBottom: '10px', fontSize: '16px' },
    select: { width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' },
    colorGrid: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
    colorCircle: { width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', border: '3-px solid transparent' },
    activeColorCircle: { border: '3px solid #333' }
};

const ACCENT_COLORS = ['#4CAF50', '#007bff', '#dc3545', '#ffc107', '#6f42c1', '#20c997'];

function AppearanceSettings() {
    const { theme, setTheme, accentColor, setAccentColor } = useTheme();

    return (
        <div style={styles.container}>
            <h2>Appearance</h2>
            <p>Customize the look and feel of your application.</p>
            
            <div style={styles.settingItem}>
                <label style={styles.label} htmlFor="theme-select">Theme</label>
                <select id="theme-select" value={theme} onChange={(e) => setTheme(e.target.value)} style={styles.select}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>

            <div style={styles.settingItem}>
                <label style={styles.label}>Accent Color</label>
                <div style={styles.colorGrid}>
                    {ACCENT_COLORS.map(color => (
                        <div 
                            key={color}
                            style={accentColor === color ? {...styles.colorCircle, ...styles.activeColorCircle, backgroundColor: color} : {...styles.colorCircle, backgroundColor: color}}
                            onClick={() => setAccentColor(color)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AppearanceSettings;