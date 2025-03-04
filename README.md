const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown is not clipped
  control: (base, state) => ({
    ...base,
    minHeight: '40px', // Adjust height for better spacing
    border: state.isFocused ? '2px solid #0052CC' : '1px solid #ccc',
    boxShadow: state.isFocused ? '0 0 5px rgba(0, 82, 204, 0.5)' : 'none',
    '&:hover': { borderColor: '#0052CC' },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: 'white',
    borderRadius: '4px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? '#0052CC' : isFocused ? '#E9F2FF' : 'white',
    color: isSelected ? 'white' : '#172B4D',
    padding: '10px',
    '&:hover': { backgroundColor: '#E9F2FF' },
  }),
};

export default selectStyles;
