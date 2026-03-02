const generateButton = document.getElementById('generate');
const numbersContainer = document.querySelector('.numbers');
const themeBtn = document.getElementById('theme-btn');

// Theme Logic
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

themeBtn.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// Lotto Logic
generateButton.addEventListener('click', () => {
    // Clear previous numbers with a slight delay for better UX
    numbersContainer.innerHTML = '';
    const numbers = generateNumbers();
    displayNumbers(numbers);
});

function generateNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

function displayNumbers(numbers) {
    numbers.forEach((number, index) => {
        const numberDiv = document.createElement('div');
        numberDiv.classList.add('number');
        numberDiv.textContent = number;
        
        // Add a small animation delay for each number
        numberDiv.style.opacity = '0';
        numberDiv.style.transform = 'translateY(10px)';
        numberDiv.style.transition = 'all 0.3s ease ' + (index * 0.1) + 's';
        
        numbersContainer.appendChild(numberDiv);
        
        // Trigger animation
        setTimeout(() => {
            numberDiv.style.opacity = '1';
            numberDiv.style.transform = 'translateY(0)';
        }, 10);
    });
}
