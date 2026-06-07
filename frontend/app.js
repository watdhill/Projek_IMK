// Simple interactivity for the profile page
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click',()=>{
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  });
});
