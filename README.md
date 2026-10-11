Kinoxii - Cinema Booking Platform

A comprehensive React-based frontend for a cinema ticketing platform. This application handles the complete user journey from browsing movies and dynamically filtering showtimes to selecting seats, managing reservation holds, and processing simulated payments. It was developed to interface with a Laravel backend API, featuring robust error handling for high-concurrency scenarios.

🌟 Key Features

Dynamic Showtime Filtering: A strict frontend-enforced filtering system allowing users to search by date, venue, format (e.g., IMAX, Standard), language, and time-of-day. All filter parameters are dynamically populated from a global truth source.

Real-Time Seat Reservation:

Interactive hall layouts with real-time availability states.

8-minute server-synced hold timers protecting selected seats during checkout.

Graceful handling of 409 Conflict errors to instantly reconcile "contested seats" if another user checks out faster.

Complete Checkout Flow: Validates booking rules (e.g., age restrictions, profile completeness), handles simulated credit card processing, and outputs detailed ticket summaries.

User Dashboard & Ticket Management: Users can update profile details (including avatars), view upcoming or past tickets, and issue self-service refunds up to 2 hours before a session starts.

Coming Soon Notifications: Subscription system for unreleased movies.

🛠️ Tech Stack

Frontend: React (bootstrapped with Vite), React Router DOM

Styling: Vanilla CSS

Data Fetching: Fetch API, URLSearchParams for complex query building

State Management: React Hooks (useState, useEffect, useMemo)

🚀 Getting Started

Prerequisites

Node.js (v18+ recommended)

npm or yarn

Installation

Clone the repository:

git clone https://github.com/yourusername/cinema-booking-system.git
cd cinema-booking-system


Install dependencies:

npm install


Start the development server:

npm run dev


The application will typically be available at http://localhost:5173.

🔌 API Integration Details

The application connects to the Kinoxii REST API (https://api.kinoxii.redberryinternship.ge/api). It implements advanced HTTP request handling, including:

Token Management: Secure extraction and injection of JWT Bearer tokens across protected routes.

Multipart Form Data: Spoofing PUT requests as POST via _method for Laravel compatibility during avatar uploads.

Deep Data Extraction: Defensive chaining and fallback logic to handle variable JSON response wrappers (e.g., paginated data.data structures).

👨‍💻 Author

Lile Ratiani

Developed as part of the Redberry Bootcamp curriculum.