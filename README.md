# TalentDash - Recruitment Platform

A modern, full-stack recruitment platform built with Google Apps Script backend and pure HTML/CSS/JavaScript frontend.

[![Watch the demo video]([https://img.youtube.com/vi/VIDEO_ID/0.jpg](https://ibb.co/4ZgScH3N))](https://youtu.be/QcvY6rE3ob0)

## 🚀 Features

- **Job Listings**: Browse and search through available job positions
- **User Management**: Register and login system for job seekers and agents
- **Application System**: Submit job applications with payment tracking
- **Agent Network**: Connect with professional recruitment agents
- **Crawler Data**: Access external job data (premium feature)
- **Payment Tracking**: Monitor application fees and payments
- **Reporting System**: Report issues and misconduct

## 🛠️ Tech Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Google Apps Script
- **Database**: Google Sheets (single spreadsheet with multiple tabs)
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Google Fonts (Montserrat, Open Sans)

## 📋 Project Structure

### Backend (Google Apps Script)
- `Code.gs` - Main backend API with all endpoints
- Single Google Sheet with multiple tabs:
  - `Users` - User accounts and profiles
  - `Jobs` - Job listings and details
  - `Applications` - Job application records
  - `Payments` - Payment transactions
  - `Reports` - User reports and issues
  - `CrawlerData` - External job data

### Frontend (HTML)
- Single-page application with responsive design
- Modern UI with video background
- Interactive job search and filtering
- Real-time notifications and loading states

## 🚀 Quick Start

### Prerequisites
- Google Account
- Google Sheets
- Google Apps Script access

### Setup Instructions

#### 1. Backend Setup

1. **Create Google Sheet**
   - Create a new Google Sheet
   - Copy the Sheet ID from the URL

2. **Setup Google Apps Script**
   - Create new Apps Script project
   - Replace `YOUR_SPREADSHEET_ID` in `CONFIG` with your Sheet ID
   - Deploy as Web App:
     - Execute as: "Me"
     - Access: "Anyone"

3. **Initialize Database**
   ```javascript
   // Run in Apps Script editor
   initializeAllSheets()    // Creates sheet structure
   addSampleData()         // Adds sample data
   ```

#### 2. Frontend Setup

1. **Update Configuration**
   - Open `index.html`
   - Find `CONFIG.APPS_SCRIPT_URL`
   - Replace with your deployed Web App URL

2. **Run Application**
   - Open `index.html` in web browser
   - The platform will automatically load job data

## 📊 API Endpoints

### User Management
- `registerUser` - Create new user account
- `loginUser` - User authentication

### Job Operations
- `getJobs` - Retrieve job listings with filters
- `submitApplication` - Apply for jobs
- `getUserApplications` - Get user's application history

### Payment System
- `recordPayment` - Track payment transactions

### Admin Features
- `getDashboardStats` - Platform statistics
- `submitReport` - Submit user reports
- `getCrawlerData` - Access external job data (premium)

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Color Scheme**: Black/white/gray with green accents
- **Video Background**: Engaging hero section
- **Interactive Elements**: Hover effects, loading states, notifications
- **Accessibility**: Proper contrast and keyboard navigation

## 💰 Pricing Model

### Job Seeker - $5/application
- Basic job applications
- Agent matching
- Application tracking

### Professional - $29/month
- Unlimited applications
- Priority agent matching
- Crawler data access

### Enterprise - $99/month
- Dedicated account manager
- Advanced analytics
- API access

## 🔧 Development

### Adding New Features
1. Update backend API in `Code.gs`
2. Add frontend JavaScript handlers
3. Update UI components in HTML
4. Test across different devices

### Customization
- Colors: Modify CSS variables in `:root`
- Fonts: Update Google Fonts imports
- Layout: Adjust grid systems and containers
- Features: Extend API endpoints as needed

## 📱 Usage Guide

### For Job Seekers
1. Browse available jobs
2. Use search and filters
3. Register/Login to apply
4. Track application status

### For Agents
1. View platform statistics
2. Access commission structure
3. Manage job postings

## 🐛 Troubleshooting

### Common Issues

1. **Jobs not loading**
   - Check Apps Script URL configuration
   - Verify Google Sheet permissions
   - Check browser console for errors

2. **Application submission failed**
   - Ensure user is logged in
   - Check internet connection
   - Verify form data completeness

3. **Video not playing**
   - Check video file path
   - Ensure browser supports video format
   - Fallback gradient background provided

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Test with sample data first

---

**Built with ❤️ using Google Apps Script and modern web technologies**
