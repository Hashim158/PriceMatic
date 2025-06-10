# 🛠️ PriceMatic

**PriceMatic** is a smart appliance marketplace that allows users to buy, sell, and evaluate the price of home appliances using machine learning. The platform includes a feature-rich mobile frontend and a FastAPI backend with a trained ML model for price prediction.

---

## 📦 Project Structure

```
PriceMatic/
├── frontend/           # React Native app (Expo)
├── backend/           # FastAPI backend + ML
├── database/          # Database schema and migrations
├── apk/              # Android APK file for direct download
├── .gitignore
└── README.md
```

## 📱 Download APK

**Quick Start for Android Users:**

[📥 Download PriceMatic APK](./apk/PriceMatic.apk)

*Install the APK directly on your Android device to start using PriceMatic immediately without setting up the development environment.*

---

## 📱 Frontend (React Native with Expo)

### 🔧 Setup

```bash
cd frontend
npm install
npx expo start
```

### ✨ Features

- **User Authentication** - Secure login and registration system
- **Marketplace** - Buy and sell appliances with ease
- **Admin Dashboard** - Comprehensive management interface
- **Smart Valuation** - AI-powered appliance price estimation
- **Chat System** - Real-time communication between buyers and sellers
- **Review & Rating System** - Community-driven feedback and ratings
- **Responsive Design** - Optimized for mobile devices

---

## 🧠 Backend (FastAPI + Machine Learning)

### 🔧 Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 🚀 API Endpoints

- `POST /predict` – Get appliance price prediction using ML model
- `POST /auth/login` – User authentication
- `POST /auth/register` – User registration

---

## 🤖 Machine Learning

Our ML model provides accurate price predictions based on various appliance features:

- **Model**: Trained with comprehensive historical appliance data
- **Technology**: Scikit-learn, pandas, joblib
- **Model File**: `backend/ml/model.pkl`
- **Features**: Brand, model, age, condition, specifications
- **Accuracy**: Continuously improved with user feedback

### 🔬 Model Training

```bash
cd backend/ml
python train_model.py
```

---

## 🖼️ Screenshots

*Add screenshots of your app views here:*

- Home Screen
- SellNow Interface
- Chat System
- Valuation Tool
- Admin Panel
- User Profile

---

## 🛡️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Authentication**: Supabase
- **State Management**: React Context API
- **Navigation**: React Navigation
- **UI Components**: Native Base / React Native Elements

### Backend
- **Framework**: FastAPI
- **Database**: SQLite (configurable)
- **ML Framework**: Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Authentication**: JWT tokens
- **Documentation**: Auto-generated with FastAPI

### Machine Learning
- **Primary Library**: Scikit-learn
- **Data Processing**: Pandas, NumPy
- **Model Serialization**: Joblib
- **Feature Engineering**: Custom preprocessing pipeline

---

## 🚀 Local Development

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Expo CLI
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hashim158/PriceMatic.git
   cd PriceMatic
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npx expo start
   ```

3. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

4. **Access the application**
   - Frontend: Expo Dev Tools will open in your browser
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

---

## 🔧 Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

**Backend (.env)**
```
DATABASE_URL=postgresql://username:password@localhost:5432/pricematic
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ML_MODEL_PATH=./ml/model.pkl
```

---

## 📊 Database Schema

The application uses PostgreSQL with the following main entities:

### Core Tables
- **users** - User accounts and profiles with authentication
- **brands** - Appliance brands with logos
- **appliances** - Main product catalog with specifications
- **selling** - User-created appliance listings
- **chat** - Real-time messaging between users
- **review** - Product reviews and ratings
- **items** - Generic items table

### Specification Tables
- **refrigerator_specifications** - Detailed fridge specifications
- **ac_specifications** - Air conditioner technical details  
- **washing_machine_specifications** - Washing machine features

### Key Features
- **UUID primary keys** for users and brands
- **Proper foreign key constraints** with cascade deletes
- **Data validation** with CHECK constraints
- **Indexes** for optimal query performance
- **Automatic timestamps** with trigger functions
- **Energy ratings** and technical specifications

### Database Setup
```sql
-- Run the schema file
psql -d your_database -f database/schema.sql
```

The complete schema is available in `/database/schema.sql` with proper constraints, indexes, and sample data.

---

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
pytest
```

---

## 🚀 Deployment

### Frontend (Expo/Vercel)
```bash
cd frontend
expo build:web
# Deploy to your preferred platform
```

### Backend (Heroku/Railway)
```bash
cd backend
# Follow your platform's deployment guide
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📋 Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📝 API Documentation

Once the backend is running, visit http://localhost:8000/docs for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

---

## 🐛 Known Issues

- [List any known issues or limitations]
- [Performance considerations]
- [Browser compatibility notes]

---

## 🗺️ Roadmap

- [ ] Add more appliance categories
- [ ] Implement image recognition for automatic categorization
- [ ] Add payment gateway integration
- [ ] Develop web version
- [ ] Add multi-language support
- [ ] Implement push notifications

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Hashim158**
- GitHub: [@Hashim158](https://github.com/Hashim158)
- Email: [hashim.siddque2002@gmail.com.com]

---

## 🙏 Acknowledgments

- Thanks to the open-source community
- Scikit-learn team for the excellent ML library
- FastAPI team for the amazing web framework
- Expo team for simplifying React Native development

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Hashim158/PriceMatic/issues) page
2. Create a new issue if your problem isn't already reported
3. Contact the maintainer directly

---

*Built with ❤️ by Hashim158*