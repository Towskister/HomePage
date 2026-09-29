document.addEventListener('DOMContentLoaded', () => {
  const printButton = document.querySelector('[data-print-resume]');
  if (printButton) printButton.addEventListener('click', () => window.print());
});
