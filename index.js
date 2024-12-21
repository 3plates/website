require('dotenv').config();
const express = require('express');
const axios = require('axios');
const md5 = require('md5');

const app = express();

const PORT = process.env.PORT || 3000;
const MC_API_KEY = process.env.MC_API_KEY;
const MC_LIST_ID = process.env.MC_LIST_ID;
const GR_SECRET_KEY = process.env.GR_SECRET_KEY;

const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: MC_API_KEY,
  server: "us22",
});

mailchimp.lists.getAllLists().then(response => {
  console.log(response);
});

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files (e.g., HTML, CSS, images)
app.use(express.static('public'));

// Handle email subscription form submission
app.post('/subscribe', async (req, res) => {
  try {
    const { email, token } = req.body;

    // Verify reCAPTCHA response
    try {
      const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
          secret: GR_SECRET_KEY,
          response: token,
        },
      });

      if (!response.data.success) {
        res.status(400).json({ error: 'reCAPTCHA verification failed' });
        return;
      }
    } catch (error) {
      console.error('reCAPTCHA verification error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    try {
      await mailchimp.lists.addListMember(MC_LIST_ID, {
        email_address: email,
        status: 'subscribed',
      });
    } catch (error) {
      console.error('Mailchimp error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    console.log(`Subscribed email: ${email}`);
    res.json({});

  } catch (error) {
    console.error('Unsubscribe error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle email unsubscription
app.get('/unsubscribe', async (req, res) => {
  try {
    // Extract the email address from the query parameters
    const { email } = req.query;
    const subscriberHash = md5(email.toLowerCase());

    await mailchimp.lists.updateListMember(
      MC_LIST_ID,
      subscriberHash,
      {
        status: "unsubscribed"
      }
    );

    console.log(`Unsubscribed email: ${email}`);
    res.redirect('/unsubscribed.html');
    
  } catch (error) {
    console.error('Unsubscribe error:', error.message);
    res.redirect('/error.html')
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
