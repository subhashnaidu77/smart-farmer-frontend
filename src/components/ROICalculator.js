import React from 'react';

const styles = {
    card: {
        backgroundColor: 'var(--bg-color)',
        padding: '25px',
        borderRadius: '12px',
        marginTop: '20px',
        border: '1px solid var(--border-color)',
    },
    title: {
        marginTop: 0,
        fontWeight: 600,
        color: 'var(--text-color)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
    },
    itemLabel: {
        color: 'var(--text-secondary)',
        fontSize: '14px',
        margin: 0,
    },
    itemValue: {
        fontSize: '18px',
        fontWeight: '600',
        margin: '4px 0 0',
        color: 'var(--accent-color)',
    }
};

function ROICalculator({ units, project }) {
    if (!project || !units || parseFloat(units) <= 0) {
        return (
            <div style={styles.card}>
                <h3 style={styles.title}>Return on Investment Calculator</h3>
                <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>Enter the number of units to see your potential return.</p>
            </div>
        );
    }

    const { pricePerUnit, returnPercentage, durationDays } = project;
    const investmentAmount = parseFloat(units) * pricePerUnit;
    const totalReturnDecimal = (returnPercentage / 100);
    const profitAmount = investmentAmount * totalReturnDecimal;
    const totalReturnAmount = investmentAmount + profitAmount;
    
    return (
        <div style={styles.card}>
            <h3 style={styles.title}>Return on Investment Calculator</h3>
            <div style={styles.grid}>
                <div>
                    <p style={styles.itemLabel}>Investment Amount</p>
                    <p style={styles.itemValue}>₹{investmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                    <p style={styles.itemLabel}>Expected Profit</p>
                    <p style={styles.itemValue}>₹{profitAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                    <p style={styles.itemLabel}>Duration</p>
                    <p style={{...styles.itemValue, color: 'var(--text-color)'}}>{durationDays} days</p>
                </div>
                <div>
                    <p style={styles.itemLabel}>Expected Total Payout</p>
                    <p style={styles.itemValue}>₹{totalReturnAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>
        </div>
    );
}

export default ROICalculator;