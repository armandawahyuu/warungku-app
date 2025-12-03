import React from 'react';

const CurrencyInput = ({ value, onChange, className, placeholder, ...props }) => {
    // Format value for display
    const formatValue = (val) => {
        if (!val && val !== 0) return '';
        return Number(val).toLocaleString('id-ID');
    };

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits

        // Create a synthetic event to match standard input behavior
        const syntheticEvent = {
            target: {
                name: props.name,
                value: rawValue
            }
        };

        onChange(syntheticEvent);
    };

    return (
        <input
            {...props}
            type="text" // Must be text to allow commas
            value={formatValue(value)}
            onChange={handleChange}
            className={className}
            placeholder={placeholder}
        />
    );
};

export default CurrencyInput;
