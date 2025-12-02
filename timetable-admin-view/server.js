require('dotenv').config();

const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const timetableRoutes = require('./routes/timetable');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3000;

// Handlebars setup
app.engine('handlebars', engine({
  defaultLayout: 'main',
  helpers: {
    eq: (a, b) => a === b,
    formatTime: (time) => {
      if (!time) return '';
      return time.substring(0, 5); // HH:MM format
    },
    formatDate: (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-GB');
    },
    getDayName: (day) => {
      const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days[day] || '';
    },
    inc: (value) => parseInt(value) + 1,
    json: (context) => JSON.stringify(context)
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/timetable', timetableRoutes);
app.use('/pdf', pdfRoutes);

// Home route
app.get('/', (req, res) => {
  res.render('home', {
    title: 'University Timetable Management System'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
  console.log(`Timetable service running on http://localhost:${PORT}`);
});

module.exports = app;