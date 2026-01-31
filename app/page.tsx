export default function Home() {
  return (
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        MFL Leagues Asset Repository
      </h1>
      
      <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
        This site hosts custom CSS, JavaScript, images, and HTML snippets for MyFantasyLeague.com leagues.
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Available Resources</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Stylesheets</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <code style={{ 
                background: '#f5f5f5', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '3px',
                fontSize: '0.9rem'
              }}>
                /css/leagues.css
              </code> - Master stylesheet for all leagues
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>JavaScript</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/js/common/</code> - Shared scripts</li>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/js/league-specific/</code> - League-specific scripts</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Images</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/images/shared/</code> - Shared images</li>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/images/league-specific/kkl/</code> - KKL league images</li>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/images/league-specific/kdl/</code> - KDL league images</li>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/images/league-specific/mmh/</code> - MMH league images</li>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/images/league-specific/bsb/</code> - BSB league images</li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>HTML Snippets</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li><code style={{ background: '#f5f5f5', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.9rem' }}>/html/snippets/</code> - Reusable HTML components</li>
          </ul>
        </div>
      </section>

      <section style={{ 
        background: '#f9f9f9', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginTop: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Leagues</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>KKL</strong> - Knuckleheads Keeper League</li>
          <li><strong>KDL</strong> - Knuckleheads Dynasty League</li>
          <li><strong>MMH</strong> - Monday Morning Hangover</li>
          <li><strong>BSB</strong> - Blood, Sweat, and Beers</li>
        </ul>
      </section>
    </main>
  );
}
