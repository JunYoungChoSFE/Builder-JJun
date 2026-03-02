# Lotto Number Generator

## Overview

This is a modern web application that generates random lottery numbers (6 unique numbers between 1 and 45) with a sleek UI and theme support.

## Features

*   **Random Generation:** Generates 6 unique numbers between 1 and 45.
*   **Sorted Results:** Numbers are displayed in ascending order for better readability.
*   **Modern UI:** Clean, responsive design with card-based layout and depth effects.
*   **Theme Support:** Toggle between Light and Dark modes.
*   **Persistence:** Saves theme preference in `localStorage`.
*   **Animations:** Smooth entry animations for generated numbers and theme transitions.
*   **Partnership Inquiry:** A contact form powered by Formspree for business inquiries.

## Project Structure

*   `index.html`: Main structure with theme toggle and container.
*   `style.css`: Uses CSS Variables for theming and modern Baseline features.
*   `main.js`: Handles generation logic, UI updates, and theme switching.

## Implementation Details

### Theme Toggle
*   Uses `data-theme` attribute on the `<html>` element.
*   CSS variables handle all color transitions.
*   JavaScript manages toggle state and persistence.

### Number Generation
*   Uses a `Set` to guarantee 6 unique values.
*   `Array.sort()` ensures numbers are ordered.
*   Dynamic creation of DOM elements with staggered CSS transitions.
