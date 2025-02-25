const selectStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }), 
    control: (base, state) => ({
      ...base,
      minHeight: '40px',
      borderRadius: '4px',
      borderColor: state.isFocused ? '#2684FF' : base.borderColor, 
      boxShadow: state.isFocused ? '0 0 0 2px rgba(38, 132, 255, 0.3)' : base.boxShadow,
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      overflow: 'visible',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '200px', 
      overflowY: 'auto', 
    }),
  };

  const spinnerStyles = {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' 
  }
  
  export { selectStyles,spinnerStyles };
  