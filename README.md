# LEEHWA VW TM System

A comprehensive Truck Management and FIFO (First In, First Out) system for LEEHWA VW operations.

## 🚀 Features

### FIFO Management
- **Excel Upload**: Upload Excel files for data management
- **Data Analysis**: Analyze shipping plans and packaging data
- **Real-time Monitoring**: Track pallet locations and status

### Truck Management
- **Live Status Display**: Real-time truck status monitoring
- **Excel-style Data Entry**: Intuitive data input with Handsontable
- **Fleet Management**: Comprehensive truck fleet operations

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: Supabase (PostgreSQL)
- **Libraries**: 
  - ExcelJS for Excel operations
  - XLSX.js for file processing
  - Handsontable for data entry
  - Tailwind CSS for styling

## 📁 Project Structure

```
├── index.html              # Main dashboard
├── css/                    # Stylesheets
├── js/                     # JavaScript modules
│   ├── core/              # Core system modules
│   ├── fifo/              # FIFO management
│   └── truck/             # Truck management
├── pages/                  # Individual pages
│   ├── fifo/              # FIFO pages
│   └── truck/             # Truck pages
├── database_setup.sql     # Database schema
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL script in `database_setup.sql` in the Supabase SQL Editor
3. Update the Supabase configuration in `js/core/supabase-config.js`

### 2. Local Development

1. Clone this repository
2. Open `index.html` in a web browser
3. Configure your Supabase credentials

### 3. Production Deployment

This project is designed to be deployed on Netlify:

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Deploy automatically

## 📊 Database Schema

### Main Tables

- **vwtm_list_data**: FIFO data storage
- **vwtm_truck_management**: Truck management data
- **vwtm_daily_summary**: Daily aggregations
- **vwtm_monthly_summary**: Monthly aggregations

## 🔧 Configuration

### Supabase Setup

1. Get your Supabase URL and anon key
2. Update `js/core/supabase-config.js`:

```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

### Environment Variables

For production deployment, set these environment variables in Netlify:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 📱 Usage

### FIFO Management
1. Navigate to "Excel Upload" to upload data files
2. Use "Shipping Plan Analysis" to analyze data
3. Export results to Excel format

### Truck Management
1. Go to "Truck Management" for data entry
2. Use "Live Status Display" for real-time monitoring
3. Track truck status and delivery information

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Anonymous access configured for public operations
- Data validation and constraints in place

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Verify Supabase credentials
2. **File Upload**: Check file format (Excel .xlsx/.xls)
3. **Data Validation**: Ensure required fields are filled

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📞 Support

For technical support or questions:
1. Check the browser console for error messages
2. Verify database connection status
3. Ensure all required fields are properly filled

## 📄 License

This project is proprietary software for LEEHWA VW operations.

## 🔄 Version History

- **v1.0.0**: Initial release with FIFO and Truck Management
- **v1.1.0**: Added real-time status monitoring
- **v1.2.0**: Enhanced Excel operations and data analysis

---

**LEEHWA VW TM System** - Efficient FIFO Management and Truck Status Monitoring
# TSYSTEMM
