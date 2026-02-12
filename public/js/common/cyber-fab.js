(function() {
  function initCyberFAB() {
    // Prevent double injection
    if (document.querySelector('.cyber-fab-container')) return;

    // Define the FAB container
    const fabContainer = document.createElement('div');
    fabContainer.className = 'cyber-fab-container';

    // Get current League ID from URL
    const leagueIdMatch = window.location.href.match(/L=(\d+)/) || window.location.href.match(/home\/(\d+)/);
    const leagueId = leagueIdMatch ? leagueIdMatch[1] : '';

    // Define menu items
    const items = [
      { tooltip: 'Submit Lineup', icon: 'fa-football-helmet', url: `/2025/options?L=${leagueId}&O=02` },
      { tooltip: 'Trade Talks', icon: 'fa-comments-dollar', url: `/2025/options?L=${leagueId}&O=05` },
      { tooltip: 'Live Scoring', icon: 'fa-broadcast-tower', url: `/2025/options?L=${leagueId}&O=43` },
      { tooltip: 'Standings', icon: 'fa-trophy', url: `/2025/standings?L=${leagueId}` }
    ];

    // Build the menu
    const menu = document.createElement('div');
    menu.className = 'cyber-fab-menu';
    
    items.forEach(item => {
      const a = document.createElement('a');
      a.className = 'cyber-fab-item';
      a.href = item.url;
      a.setAttribute('data-tooltip', item.tooltip);
      a.innerHTML = `<i class="fa-solid ${item.icon}"></i>`;
      menu.appendChild(a);
    });

    // Build the main button
    const mainBtn = document.createElement('div');
    mainBtn.className = 'cyber-fab-main';
    mainBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    
    mainBtn.addEventListener('click', () => {
      menu.classList.toggle('active');
      const icon = mainBtn.querySelector('i');
      if (menu.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-plus';
      }
    });

    // Assemble
    fabContainer.appendChild(menu);
    fabContainer.appendChild(mainBtn);
    document.body.appendChild(fabContainer);
  }

  function initMobileLabels() {
    // Find all MFL report tables
    const tables = document.querySelectorAll('.report');
    
    tables.forEach(table => {
      // Get headers (th)
      const headers = Array.from(table.querySelectorAll('thead th, .rowheader th, tr:first-child th'));
      if (headers.length === 0) return;

      const headerLabels = headers.map(th => th.innerText.trim());

      // Apply labels to each row's cells
      const rows = table.querySelectorAll('tr.oddtablerow, tr.eventablerow');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
          if (headerLabels[index] && !cell.getAttribute('data-label')) {
            cell.setAttribute('data-label', headerLabels[index]);
          }
        });
      });
    });
  }

  // Run on load and after MFL ajax calls
  function runAll() {
    initCyberFAB();
    initMobileLabels();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAll);
  } else {
    runAll();
  }

  // Handle MFL's AJAX page updates
  const observer = new MutationObserver((mutations) => {
    // Debounce or check if reports were added
    if (document.querySelector('.report td:not([data-label])')) {
      initMobileLabels();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
