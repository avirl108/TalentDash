// Code.gs - Recruitment Platform Backend API (Single Spreadsheet with Multiple Tabs)

// Configuration - Only one Google Sheet ID needed
const CONFIG = {
  spreadsheetId: 'YOUR_SPREADSHEET_ID' // Replace with your Google Sheet ID
};

// Sheet tab names
const SHEET_NAMES = {
  USERS: 'Users',
  JOBS: 'Jobs',
  APPLICATIONS: 'Applications',
  PAYMENTS: 'Payments',
  REPORTS: 'Reports',
  CRAWLER_DATA: 'CrawlerData'
};

// Get specific sheet tab
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    // Create tab if it doesn't exist
    sheet = spreadsheet.insertSheet(sheetName);
    initializeSheetHeaders(sheetName);
  }
  
  return sheet;
}

// Initialize sheet headers
function initializeSheetHeaders(sheetName) {
  const sheet = getSheet(sheetName);
  const headers = getHeadersForSheet(sheetName);
  sheet.clear();
  sheet.appendRow(headers);
}

// Get headers for each sheet
function getHeadersForSheet(sheetName) {
  const headers = {
    [SHEET_NAMES.USERS]: ['id', 'email', 'name', 'type', 'join_date', 'status', 'phone', 'location', 'industry'],
    [SHEET_NAMES.JOBS]: ['id', 'title', 'company', 'location', 'salary', 'type', 'description', 'category', 'agent_id', 'posted_date', 'status', 'application_fee'],
    [SHEET_NAMES.APPLICATIONS]: ['id', 'job_id', 'user_id', 'agent_id', 'submit_date', 'status', 'resume_url', 'cover_letter', 'interview_date', 'hire_date', 'application_fee'],
    [SHEET_NAMES.PAYMENTS]: ['id', 'user_id', 'type', 'amount', 'date', 'application_id', 'status', 'description'],
    [SHEET_NAMES.REPORTS]: ['id', 'reporter_id', 'target_id', 'target_type', 'reason', 'description', 'date', 'status'],
    [SHEET_NAMES.CRAWLER_DATA]: ['id', 'title', 'company', 'location', 'salary', 'description', 'source', 'posted_date', 'apply_url', 'category']
  };
  
  return headers[sheetName] || [];
}

// Initialize all sheets
function initializeAllSheets() {
  try {
    // Check configuration
    if (!CONFIG.spreadsheetId || CONFIG.spreadsheetId === 'YOUR_SPREADSHEET_ID') {
      throw new Error('Please configure CONFIG.spreadsheetId first');
    }
    
    const sheetNames = Object.values(SHEET_NAMES);
    
    // Initialize each sheet using for loop
    for (let i = 0; i < sheetNames.length; i++) {
      const sheetName = sheetNames[i];
      initializeSheetHeaders(sheetName);
    }
    
    Logger.log('All sheets initialized successfully');
    return true;
    
  } catch (error) {
    Logger.log('Initialization failed: ' + error.message);
    return false;
  }
}

// Web app entry point
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index');
}

// API request handler
function doPost(e) {
  try {
    const action = e.parameter.action;
    let result = {};
    
    switch(action) {
      case 'getJobs':
        result = getJobs(e.parameter);
        break;
      case 'submitApplication':
        result = submitApplication(e.parameter);
        break;
      case 'getUserApplications':
        result = getUserApplications(e.parameter.userId);
        break;
      case 'submitReport':
        result = submitReport(e.parameter);
        break;
      case 'getCrawlerData':
        result = getCrawlerData(e.parameter);
        break;
      case 'recordPayment':
        result = recordPayment(e.parameter);
        break;
      case 'registerUser':
        result = registerUser(e.parameter);
        break;
      case 'loginUser':
        result = loginUser(e.parameter);
        break;
      case 'getDashboardStats':
        result = getDashboardStats();
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// User registration
function registerUser(userData) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Check if email already exists
  const emailIndex = headers.indexOf('email');
  const existingUser = data.find(row => row[emailIndex] === userData.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Add new user
  const userId = Utilities.getUuid();
  const rowData = [
    userId,
    userData.email,
    userData.name,
    userData.type || 'job_seeker',
    new Date(),
    'active',
    userData.phone || '',
    userData.location || '',
    userData.industry || ''
  ];
  
  sheet.appendRow(rowData);
  
  return {
    success: true,
    userId: userId,
    message: 'User registered successfully'
  };
}

// User login
function loginUser(loginData) {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const emailIndex = headers.indexOf('email');
  const user = data.find(row => row[emailIndex] === loginData.email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const userId = user[headers.indexOf('id')];
  const userName = user[headers.indexOf('name')];
  const userType = user[headers.indexOf('type')];
  
  return {
    success: true,
    userId: userId,
    name: userName,
    type: userType
  };
}

// Get job listings
function getJobs(filters = {}) {
  const sheet = getSheet(SHEET_NAMES.JOBS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const jobs = data.slice(1).map(row => {
    let job = {};
    headers.forEach((header, index) => {
      job[header] = row[index];
    });
    return job;
  });
  
  // Apply filters
  let filteredJobs = jobs.filter(job => job.status === 'active');
  
  if (filters.location && filters.location !== 'All Locations') {
    filteredJobs = filteredJobs.filter(job => 
      job.location && job.location.includes(filters.location)
    );
  }
  
  if (filters.category && filters.category !== 'All Categories') {
    filteredJobs = filteredJobs.filter(job => 
      job.category && job.category === filters.category
    );
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      (job.title && job.title.toLowerCase().includes(searchTerm)) ||
      (job.company && job.company.toLowerCase().includes(searchTerm)) ||
      (job.description && job.description.toLowerCase().includes(searchTerm))
    );
  }
  
  return {
    success: true,
    jobs: filteredJobs,
    total: filteredJobs.length
  };
}

// Submit job application
function submitApplication(applicationData) {
  const applicationsSheet = getSheet(SHEET_NAMES.APPLICATIONS);
  
  // Generate application ID
  const applicationId = Utilities.getUuid();
  
  // Prepare application data
  const rowData = [
    applicationId,
    applicationData.jobId,
    applicationData.userId,
    applicationData.agentId || '',
    new Date(),
    'submitted',
    applicationData.resumeUrl || '',
    applicationData.coverLetter || '',
    '',
    '',
    5 // application_fee
  ];
  
  // Add to applications sheet
  applicationsSheet.appendRow(rowData);
  
  return {
    success: true,
    applicationId: applicationId,
    message: 'Application submitted successfully'
  };
}

// Record payment
function recordPayment(paymentData) {
  const sheet = getSheet(SHEET_NAMES.PAYMENTS);
  
  const paymentId = Utilities.getUuid();
  const rowData = [
    paymentId,
    paymentData.userId,
    paymentData.type,
    paymentData.amount,
    new Date(),
    paymentData.applicationId || '',
    'completed',
    paymentData.description || ''
  ];
  
  sheet.appendRow(rowData);
  return paymentId;
}

// Get user applications
function getUserApplications(userId) {
  const sheet = getSheet(SHEET_NAMES.APPLICATIONS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const userIdIndex = headers.indexOf('user_id');
  const applications = data.slice(1)
    .filter(row => row[userIdIndex] === userId)
    .map(row => {
      let app = {};
      headers.forEach((header, index) => {
        app[header] = row[index];
      });
      return app;
    });
  
  return {
    success: true,
    applications: applications
  };
}

// Submit report
function submitReport(reportData) {
  const sheet = getSheet(SHEET_NAMES.REPORTS);
  
  const reportId = Utilities.getUuid();
  const rowData = [
    reportId,
    reportData.reporterId,
    reportData.targetId,
    reportData.targetType,
    reportData.reason,
    reportData.description || '',
    new Date(),
    'pending'
  ];
  
  sheet.appendRow(rowData);
  
  return {
    success: true,
    reportId: reportId,
    message: 'Report submitted successfully'
  };
}

// Get crawler data (paid feature)
function getCrawlerData(requestData) {
  // Check if user has crawler data access
  if (!hasCrawlerAccess(requestData.userId)) {
    throw new Error('Crawler data access requires payment. Please purchase crawler access plan.');
  }
  
  const sheet = getSheet(SHEET_NAMES.CRAWLER_DATA);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const jobs = data.slice(1).map(row => {
    let job = {};
    headers.forEach((header, index) => {
      job[header] = row[index];
    });
    return job;
  });
  
  // Apply filters
  let filteredJobs = jobs;
  if (requestData.source) {
    filteredJobs = filteredJobs.filter(job => job.source === requestData.source);
  }
  
  if (requestData.postedAfter) {
    const date = new Date(requestData.postedAfter);
    filteredJobs = filteredJobs.filter(job => new Date(job.posted_date) > date);
  }
  
  // Limit results
  const limit = Math.min(requestData.limit || 50, 100);
  filteredJobs = filteredJobs.slice(0, limit);
  
  return {
    success: true,
    jobs: filteredJobs,
    total: filteredJobs.length,
    accessUntil: getCrawlerAccessExpiry(requestData.userId)
  };
}

// Check if user has crawler access
function hasCrawlerAccess(userId) {
  const paymentsSheet = getSheet(SHEET_NAMES.PAYMENTS);
  const data = paymentsSheet.getDataRange().getValues();
  const headers = data[0];
  
  const userIdIndex = headers.indexOf('user_id');
  const typeIndex = headers.indexOf('type');
  const dateIndex = headers.indexOf('date');
  const statusIndex = headers.indexOf('status');
  
  // Check for crawler access payment in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return data.some(row => {
    return row[userIdIndex] === userId && 
           row[typeIndex] === 'crawler_access' && 
           new Date(row[dateIndex]) > thirtyDaysAgo &&
           row[statusIndex] === 'completed';
  });
}

// Get crawler access expiry
function getCrawlerAccessExpiry(userId) {
  const paymentsSheet = getSheet(SHEET_NAMES.PAYMENTS);
  const data = paymentsSheet.getDataRange().getValues();
  const headers = data[0];
  
  const userIdIndex = headers.indexOf('user_id');
  const typeIndex = headers.indexOf('type');
  const dateIndex = headers.indexOf('date');
  const statusIndex = headers.indexOf('status');
  
  const payment = data.find(row => 
    row[userIdIndex] === userId && 
    row[typeIndex] === 'crawler_access' && 
    row[statusIndex] === 'completed'
  );
  
  if (payment) {
    const paymentDate = new Date(payment[dateIndex]);
    paymentDate.setDate(paymentDate.getDate() + 30);
    return paymentDate;
  }
  
  return null;
}

// Get dashboard statistics
function getDashboardStats() {
  const usersSheet = getSheet(SHEET_NAMES.USERS);
  const jobsSheet = getSheet(SHEET_NAMES.JOBS);
  const applicationsSheet = getSheet(SHEET_NAMES.APPLICATIONS);
  const paymentsSheet = getSheet(SHEET_NAMES.PAYMENTS);
  
  const usersData = usersSheet.getDataRange().getValues();
  const jobsData = jobsSheet.getDataRange().getValues();
  const applicationsData = applicationsSheet.getDataRange().getValues();
  const paymentsData = paymentsSheet.getDataRange().getValues();
  
  // Exclude header row
  const totalUsers = usersData.length - 1;
  const totalJobs = jobsData.length - 1;
  const totalApplications = applicationsData.length - 1;
  
  // Calculate total revenue
  const paymentsHeaders = paymentsData[0];
  const amountIndex = paymentsHeaders.indexOf('amount');
  const totalRevenue = paymentsData.slice(1).reduce((sum, row) => sum + (parseFloat(row[amountIndex]) || 0), 0);
  
  return {
    success: true,
    stats: {
      totalUsers: totalUsers,
      totalJobs: totalJobs,
      totalApplications: totalApplications,
      totalRevenue: totalRevenue.toFixed(2),
      activeJobs: jobsData.filter(row => row[jobsData[0].indexOf('status')] === 'active').length - 1
    }
  };
}

// Add sample data to all sheets
function addSampleData() {
  addSampleUsers();
  addSampleJobs();
  addSampleApplications();
  addSamplePayments();
  addSampleReports();
  addSampleCrawlerData();
  Logger.log('All sample data added successfully');
}

// Sample data functions
function addSampleUsers() {
  const sheet = getSheet(SHEET_NAMES.USERS);
  const sampleUsers = [
    ['user001', 'john.doe@email.com', 'John Doe', 'job_seeker', '2024-01-15', 'active', '+1234567890', 'San Francisco, CA', 'Technology'],
    ['user002', 'sarah.wilson@email.com', 'Sarah Wilson', 'agent', '2024-01-10', 'active', '+1234567891', 'New York, NY', 'Finance'],
    ['user003', 'mike.chen@email.com', 'Mike Chen', 'job_seeker', '2024-01-20', 'active', '+1234567892', 'Boston, MA', 'Healthcare'],
    ['user004', 'techcorp@email.com', 'TechCorp HR', 'company', '2024-01-05', 'active', '+1234567893', 'San Francisco, CA', 'Technology'],
    ['user005', 'lisa.garcia@email.com', 'Lisa Garcia', 'agent', '2024-01-12', 'active', '+1234567894', 'Austin, TX', 'Marketing']
  ];
  
  sampleUsers.forEach(user => sheet.appendRow(user));
}

function addSampleJobs() {
  const sheet = getSheet(SHEET_NAMES.JOBS);
  const sampleJobs = [
    ['job001', 'Senior Frontend Developer', 'TechCorp Inc.', 'San Francisco, CA / Remote', '$120k - $150k', 'Full-time', 'We\'re looking for an experienced frontend developer to join our growing team and help build the next generation of web applications.', 'Technology', 'user002', '2024-01-18', 'active', 5],
    ['job002', 'Product Manager', 'InnovateLabs', 'New York, NY', '$130k - $160k', 'Full-time', 'Join our product team to drive the vision and execution of our flagship software products used by millions worldwide.', 'Technology', 'user005', '2024-01-20', 'active', 5],
    ['job003', 'Data Scientist', 'DataWorks', 'Boston, MA / Remote', '$110k - $140k', 'Full-time', 'We\'re seeking a data scientist to analyze complex datasets and build predictive models that drive business decisions.', 'Technology', 'user002', '2024-01-22', 'active', 5],
    ['job004', 'Marketing Director', 'BrandBoost', 'Austin, TX / Remote', '$100k - $130k', 'Full-time', 'Lead our marketing team in developing innovative campaigns that drive brand awareness and customer engagement.', 'Marketing', 'user005', '2024-01-19', 'active', 5],
    ['job005', 'Financial Analyst', 'WealthGuard', 'Chicago, IL', '$90k - $120k', 'Full-time', 'Analyze financial data, prepare reports, and provide insights to support strategic business decisions.', 'Finance', 'user002', '2024-01-21', 'active', 5]
  ];
  
  sampleJobs.forEach(job => sheet.appendRow(job));
}

function addSampleApplications() {
  const sheet = getSheet(SHEET_NAMES.APPLICATIONS);
  const sampleApplications = [
    ['app001', 'job001', 'user001', 'user002', '2024-01-25', 'submitted', 'https://drive.google.com/resume_john.pdf', 'Experienced frontend developer with 5+ years in React and Vue.js...', '', '', 5],
    ['app002', 'job002', 'user003', 'user005', '2024-01-26', 'interview_scheduled', 'https://drive.google.com/resume_mike.pdf', 'Product manager with strong background in agile methodologies...', '2024-02-01', '', 5],
    ['app003', 'job003', 'user001', 'user002', '2024-01-27', 'submitted', 'https://drive.google.com/resume_john.pdf', 'Passionate about data science and machine learning...', '', '', 5],
    ['app004', 'job001', 'user003', 'user002', '2024-01-28', 'hired', 'https://drive.google.com/resume_mike.pdf', 'Full-stack developer with expertise in modern web technologies...', '2024-01-30', '2024-02-15', 5]
  ];
  
  sampleApplications.forEach(app => sheet.appendRow(app));
}

function addSamplePayments() {
  const sheet = getSheet(SHEET_NAMES.PAYMENTS);
  const samplePayments = [
    ['pay001', 'user001', 'application', 5, '2024-01-25', 'app001', 'completed', 'Application fee for job job001'],
    ['pay002', 'user003', 'application', 5, '2024-01-26', 'app002', 'completed', 'Application fee for job job002'],
    ['pay003', 'user001', 'application', 5, '2024-01-27', 'app003', 'completed', 'Application fee for job job003'],
    ['pay004', 'user003', 'application', 5, '2024-01-28', 'app004', 'completed', 'Application fee for job job001'],
    ['pay005', 'user001', 'crawler_access', 10, '2024-01-29', '', 'completed', '30-day crawler data access'],
    ['pay006', 'user003', 'interview_bonus', 20, '2024-02-01', 'app002', 'completed', 'Interview bonus for application app002']
  ];
  
  samplePayments.forEach(payment => sheet.appendRow(payment));
}

function addSampleReports() {
  const sheet = getSheet(SHEET_NAMES.REPORTS);
  const sampleReports = [
    ['rep001', 'user001', 'user005', 'agent', 'Unprofessional behavior', 'Agent did not respond to messages for over 2 weeks after payment', '2024-01-30', 'pending'],
    ['rep002', 'user003', 'user002', 'agent', 'Resume misuse', 'Suspect agent shared my resume with unauthorized third parties', '2024-02-01', 'under_review']
  ];
  
  sampleReports.forEach(report => sheet.appendRow(report));
}

function addSampleCrawlerData() {
  const sheet = getSheet(SHEET_NAMES.CRAWLER_DATA);
  const sampleCrawlerData = [
    ['crawl001', 'Backend Engineer', 'StartupXYZ', 'Remote', '$100k - $130k', 'Looking for backend engineer with Node.js and Python experience to build scalable APIs.', 'LinkedIn', '2024-01-28', 'https://linkedin.com/jobs/view/123', 'Technology'],
    ['crawl002', 'UX Designer', 'DesignFirst Inc.', 'Seattle, WA', '$85k - $110k', 'Create beautiful and intuitive user interfaces for our enterprise software products.', 'Indeed', '2024-01-29', 'https://indeed.com/jobs/456', 'Design'],
    ['crawl003', 'DevOps Engineer', 'CloudScale', 'Remote', '$120k - $150k', 'Implement and maintain CI/CD pipelines, manage cloud infrastructure on AWS.', 'Glassdoor', '2024-01-27', 'https://glassdoor.com/jobs/789', 'Technology'],
    ['crawl004', 'Sales Manager', 'GrowthCorp', 'Miami, FL', '$80k + commission', 'Lead sales team, develop strategies to expand market presence in Latin America.', 'Monster', '2024-01-30', 'https://monster.com/jobs/012', 'Sales'],
    ['crawl005', 'HR Specialist', 'PeopleFirst', 'Denver, CO', '$70k - $90k', 'Manage recruitment processes, employee relations, and HR operations.', 'ZipRecruiter', '2024-01-26', 'https://ziprecruiter.com/jobs/345', 'HR']
  ];
  
  sampleCrawlerData.forEach(data => sheet.appendRow(data));
}