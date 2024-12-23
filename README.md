

📜 Description
The Rick and Morty Store is a dynamic, responsive, and fully functional e-commerce application built using HTML, CSS, JavaScript, and Bootstrap. This store leverages the Rick and Morty API to showcase characters as products, allowing users to explore, add products to a cart, and complete their shopping experience interactively.

This project demonstrates best practices in modern web development, focusing on responsive design, dynamic rendering of data, and interactive functionalities such as a shopping cart and a contact form.

🌟 Features
Dynamic Product Rendering: Fetches character data from the API and dynamically displays it on the store.
Featured Products Section: Highlights top characters on the homepage.
Product Detail Page: Shows detailed information about each product when selected.
Shopping Cart:
Add, remove, or update product quantities.
Displays the total price dynamically.
Persists data using localStorage.
Responsive Design:
Built with Flexbox and CSS Grid for layout.
Fully responsive across all screen sizes.
Interactive Contact Form:
Validates inputs and provides console feedback.
Styled for a modern user experience.
Dynamic Reviews Section: Rotates user reviews in a Bootstrap carousel.
Custom Navbar:
Created with Flexbox.
Responsive behavior for desktop and mobile.
🛠️ Tools and Technologies
Frontend Frameworks and Libraries:
HTML5 and CSS3 for structure and styling.
Bootstrap for responsive design components.
JavaScript:
Fetch API for consuming the Rick and Morty API.
DOM manipulation for rendering dynamic content.
localStorage for cart persistence.
API Integration:
Rick and Morty API to fetch product data.
GitHub Hosting:
Deployed using GitHub Pages for seamless access.


project-directory/
│
├── index.html                # Homepage
├── product-list-page.html    # Product listing page
├── product-detail-page.html  # Product detail page
├── cart.html                 # Shopping cart page
├── form.html                 # Contact form page
├── review.html               # Reviews page
│
├── css/
│   ├── styles.css            # Main CSS file
│
├── js/
│   ├── index.js              # Main JavaScript logic
│
├── images/                   # Image assets
│
├── README.md                 # Project documentation
└── LICENSE                   # Licensing information



 Future Maintenance
Code Modularity:
Ensure JavaScript logic for features such as the cart, form validation, and rendering is kept modular for scalability.
Testing:
Implement unit tests for form validation and cart functionalities using frameworks like Jest.
Performance Optimization:
Minimize API calls and implement lazy loading for images.
Accessibility:
Enhance ARIA roles and improve keyboard navigation for usability.

🚀 How to Run Locally
Clone the repository:
bash
Copiar código
git clone https://github.com/your-username/rick-and-morty-store.git
cd rick-and-morty-store

Open index.html in your browser or use a live server for local development.
💡 Acknowledgments
Rick and Morty API for providing the character data.
Bootstrap for responsive components.