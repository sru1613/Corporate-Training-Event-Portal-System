const Loader = ({ overlay = true }) => {
  if (overlay) {
    return (
      <div className="loader-overlay">
        <div style={{ textAlign: 'center' }}>
          <div className="loader" />
          <p style={{ color: 'white', marginTop: '1rem', fontSize: '0.875rem' }}>Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div className="loader" />
    </div>
  );
};

export default Loader;
