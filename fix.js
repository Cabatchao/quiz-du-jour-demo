/* fix.js - Global function wrappers for Quiz du Jour
 * Exposes functions needed by onclick handlers that are scoped inside the IIFE
 */

// Screen mapping
var SM = {
  home: 'homeScreen', 'home-screen': 'homeScreen',
  quiz: 'quizScreen', 'quiz-screen': 'quizScreen',
  results: 'resultsScreen', 'results-screen': 'resultsScreen',
  leaderboard: 'leaderboardScreen', 'leaderboard-screen': 'leaderboardScreen',
  shop: 'shopScreen', 'shop-screen': 'shopScreen',
  profile: 'profileScreen', 'profile-screen': 'profileScreen',
  draw: 'drawScreen', 'draw-screen': 'drawScreen',
  'auth-screen': '__auth__'
};

function showScreen(id) {
  // If app.showScreen exists (IIFE exported it), delegate to it
  if (window.app && typeof window.app.showScreen === 'function') {
    window.app.showScreen(id);
    return;
  }
  // Fallback: basic screen switching
  var m = SM[id] || id;
  if (m === '__auth__') {
    var l = document.getElementById('loginModal');
    if (l) { l.style.display = 'flex'; l.classList.remove('hidden'); }
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    return;
  }
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  var t = document.getElementById(m);
  if (t) t.classList.add('active');
}

function toggleMobileMenu() {
  if (window.app && typeof window.app.toggleMobileMenu === 'function') {
    window.app.toggleMobileMenu();
    return;
  }
  var m = document.getElementById('mobileMenu');
  if (m) m.classList.toggle('open');
}

function handleDemoLogin() {
  if (window.app && typeof window.app.submitUsername === 'function') {
    window.app.submitUsername();
    return;
  }
  var i = document.getElementById('loginUsername');
  if (!i) return;
  var u = i.value.trim();
  if (!u || u.length < 3) { alert('Pseudo: 3 caracteres minimum'); return; }
  var uid = 'user_' + Date.now();
  localStorage.setItem('currentUser', JSON.stringify({ id: uid, username: u }));
  localStorage.setItem('playerProfile', JSON.stringify({ id: uid, pseudo: u, email: 'demo@quizdujour.fr', total_score: 0, created_at: new Date().toISOString() }));
  var m = document.getElementById('loginModal');
  if (m) m.style.display = 'none';
  showScreen('home');
}

// quitQuiz - stops the current quiz and returns to home
function quitQuiz() {
  if (window.app && typeof window.app.stopTimer === 'function') {
    try { window.app.stopTimer(); } catch(e) {}
  }
  showScreen('home');
  if (window.app && typeof window.app.navigateToHome === 'function') {
    window.app.navigateToHome();
  }
}

// nextQuestion - delegates to the IIFE's nextQuestion
function nextQuestion() {
  if (window.app && typeof window.app.nextQuestion === 'function') {
    window.app.nextQuestion();
  }
}

// switchLeaderboardTab - filters leaderboard by period
function switchLeaderboardTab(tab) {
  // Update active tab styling
  var tabs = document.querySelectorAll('.leaderboard-tab');
  tabs.forEach(function(t) {
    t.classList.remove('active');
    if (t.getAttribute('data-tab') === tab) {
      t.classList.add('active');
    }
  });
  // Delegate to app.filterLeaderboard if available
  if (window.app && typeof window.app.filterLeaderboard === 'function') {
    window.app.filterLeaderboard(tab);
  }
}

// showToast - handles both (message, type) and (type, title, message) signatures
function showToast(arg1, arg2, arg3) {
  if (window.app && typeof window.app.showToast === 'function') {
    // IIFE showToast takes (message, type)
    if (arg3 !== undefined) {
      // Called as showToast(type, title, message) - reorder for IIFE
      window.app.showToast(arg2 + ': ' + arg3, arg1);
    } else if (arg2 !== undefined) {
      window.app.showToast(arg1, arg2);
    } else {
      window.app.showToast(arg1);
    }
    return;
  }
  // Fallback: create a simple toast
  var message = arg3 !== undefined ? (arg2 + ': ' + arg3) : arg1;
  var type = arg3 !== undefined ? arg1 : (arg2 || 'info');
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 24px;border-radius:8px;color:#fff;z-index:9999;font-family:Inter,sans-serif;font-size:14px;opacity:0;transition:opacity 0.3s;';
  if (type === 'info') toast.style.background = '#3b82f6';
  else if (type === 'success') toast.style.background = '#10b981';
  else if (type === 'error') toast.style.background = '#ef4444';
  else toast.style.background = '#f59e0b';
  document.body.appendChild(toast);
  setTimeout(function() { toast.style.opacity = '1'; }, 10);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

// DOMContentLoaded handler for login state restoration
document.addEventListener('DOMContentLoaded', function() {
  try {
    var su = JSON.parse(localStorage.getItem('currentUser'));
    var sp = JSON.parse(localStorage.getItem('playerProfile'));
    if (su && sp) {
      var m = document.getElementById('loginModal');
      if (m) m.style.display = 'none';
      var ui = document.getElementById('userInfo');
      if (ui) ui.style.display = 'flex';
      var un = document.getElementById('userName');
      if (un) un.textContent = su.username;
      var ua = document.getElementById('userAvatar');
      if (ua) ua.textContent = su.username.charAt(0).toUpperCase();
    }
  } catch(e) {}
});
