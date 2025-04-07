# Author Profile Modal

This project implements a profile information modal for authors. The modal displays when a user hovers over or clicks on the author's name. 

## Project Structure

```
author-profile-modal
├── src
│   ├── components
│   │   ├── AuthorModal.tsx      # Component for displaying author's profile information in a modal
│   │   └── AuthorCard.tsx       # Component for displaying author's name with hover/click functionality
│   ├── styles
│   │   └── modal.css            # CSS styles for the modal
│   ├── utils
│   │   └── api.ts               # Utility functions for fetching author data
│   ├── App.tsx                  # Main application component
│   └── index.tsx                # Entry point of the application
├── public
│   ├── index.html               # Main HTML file
│   └── favicon.ico              # Favicon for the application
├── package.json                  # npm configuration file
├── tsconfig.json                # TypeScript configuration file
└── README.md                    # Documentation for the project
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd author-profile-modal
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the development server:
   ```
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

## Features

- Author profile information displayed in a modal.
- Modal visibility controlled by hover and click events.
- Responsive design with smooth transitions.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes. 

## License

This project is licensed under the MIT License.