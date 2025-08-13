# 🍽️ Zomato Restaurant Explorer

A full-stack application to explore and search restaurants from the **Zomato Restaurants Dataset** ([Kaggle link](https://www.kaggle.com/datasets/shrutimehta/zomato-restaurants-data)) with advanced filtering, location-based search, and pagination support.

## 📜 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
---

## 📌 Overview

This project is designed to:
1. Load the **Zomato Restaurant dataset** into a database.
2. Serve the restaurant data through a RESTful **Web API**.
3. Provide an interactive **Web Application** for users to browse, filter, and search restaurants.

The application is modular and built in three main parts:
- **Data Loader Script** — Loads dataset into the database.
- **Web API Service** — Exposes endpoints for data retrieval and searching.
- **Frontend UI** — Connects to API to display restaurants with a clean user interface.

---

## ✨ Features

### Core Features
- **Restaurant List & Detail View**
- **Pagination Support**
- **Get Restaurant by ID**
- **Search by Location** (latitude/longitude with radius filter)
- **Filter Options**:
  - By Country
  - By Average Spend for Two People
  - By Cuisine Types
- **Search by Name/Description**

### Optional Features Implemented
- ✅ Country-based filtering  
- ✅ Cuisine filtering  
- ✅ Average cost filtering  
- ✅ Name & description search  

### Missing Feature (Future Plan)
- 🔄 Image Search: Upload a food image (e.g., ice cream, pasta) and find restaurants offering similar cuisines.

---

## 🛠 Tech Stack

**Backend**:
- Node.js / Express.js (API Service)
- MongoDB (Database)
- Mongoose 

**Frontend**:
- React.js + TailwindCSS
- React Router (Navigation)

**Other**:
- CSV Parsing (Data Loader Script)
- Postman (API testing)

---

## 🤝 Contribution

We welcome contributions! If you'd like to improve the project, follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Added feature'`).
4. Push the branch (`git push origin feature-name`).
5. Open a Pull Request for review.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

If you have any questions or suggestions, feel free to contact me at:

✉️ **Email**: [jayarajchippada4@gmail.com](mailto:jayarajchippada4@gmail.com)

---


