const formatAmount = (amount) => {
    if (amount >= 1000000000) {
        return (amount / 1000000000).toFixed(2) + ' Arab';
    } else if (amount >= 10000000) {
        return (amount / 10000000).toFixed(2) + ' Crore';
    } else if (amount >= 100000) {
        return (amount / 100000).toFixed(2) + ' Lakh';
    } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'K'; // No division by 100, directly use 1000 for "K"
    }
    return amount.toString(); // For amounts less than 1000, return the amount as is
};

module.exports = { formatAmount };
