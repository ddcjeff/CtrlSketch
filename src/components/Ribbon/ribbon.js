
export function setupRibbon() {
  fetch('/ribbon.html')
    .then(res => res.text())
    .then(html => {
      const ribbonRoot = document.getElementById('ribbon-root');
      if (!ribbonRoot) return;
      ribbonRoot.innerHTML = html;
      initTabs();
    });
}

function initTabs() {
  window.switchRibbon = function(id) {
    document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ribbon-content').forEach(c => c.classList.remove('active'));
    document.querySelector(`.ribbon-tab[onclick*="${id}"]`)?.classList.add('active');
    document.getElementById(id)?.classList.add('active');
  };
}
