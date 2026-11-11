# Practicum topics used in CockpitIQ

The project follows the Web Technology Practicum Manual topics and keeps each feature in a small, named file.

| Practicum topic | How CockpitIQ uses it | Main files |
| --- | --- | --- |
| HTML pages and semantic structure | Uses headings, navigation, `main`, sections, forms, and `footer` elements. | `index.html`, `home.html`, `trainer.html`, `register.html`, `signup.html`, `signin.html` |
| CSS text, layout, and positioning | Uses CSS classes to style the cockpit, checklist, navigation, dialogs, and cards. | `css/styles.css` |
| Flexbox, Grid, and media queries | Uses Flexbox for small screens and Grid for the desktop dashboard. | `css/styles.css` |
| Forms and input validation | Checks name, ID, email, phone, password, division, terms, and confirmation fields. | `register.html`, `signup.html`, `signin.html`, `js/validation.js` |
| DOM manipulation and events | Creates chatbot messages, checklist rows, calculator fields, and responds to clicks and keyboard input. | `js/script.js`, `js/chatbot.js`, `js/calculator.js`, `js/dashboard.js` |
| Functions, conditions, loops, and arrays | Checks simulator actions, updates the checklist, calculates values, and matches help keywords. | `js/script.js`, `js/chatbot.js`, `js/calculator.js`, `js/validation.js` |
| Fetch/API and CRUD | Supabase saves, reads, and deletes signed-in users' test attempts. Each user can access only their own attempts. | `js/supabase-client.js`, `supabase/schema.sql`, `js/auth-ui.js` |
| User preferences and `localStorage` | Saves the selected theme and local chatbot conversation. | `js/theme.js`, `js/theme-init.js`, `js/chatbot.js` |

The chatbot is an offline keyword matcher with fixed answers, as required by the project checklist. Supabase is used for persistent accounts and test history.
