# tinyApp

#### Intro

These files contain the code necessary to create a fully functioning URL shorterning app, that will only work for you, on your own computer, and won't remember anything you've done once you close it. But it works!

To get this app up and running, clone the repo and run 'NPM Install'. I'm under the impression this will install all the dependencies in the JSON package. 

Then run 'npm start', and the express module will do the rest. This app is currently set to run on port 8080, but you can change that by altering the PORT value in the express_server.js file. 


# The repo consists of:

## The express_server.js file.
- This file contains all of the endpoints for the app. You can run this file from the Terminal with NPM start, and it will create a server running on Port 8080 by default. 

- In its current form this server allows users to create an account, submit URLs for their favorite websites and then store shortened versions of those URLs in a simple library. Users can then share those shortened links, and anyone with the link will be redirected to the original website. 
- Users can register accounts, sign in and out, and the server restricts users from seeing other user's links or accessing most pages without being signed in. 
- It stores hashed passwords, and creates encrypted cookies to track user Ids. 

### Dependencies
- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- It also depends on a Javascript file of helper functions called helpers.js. 

## helpers.js
- This file contains 4 helper functions used in the main server file. 
- These functions are modular.  
- The simpler two are used to generate random ID values for users or URLs. 
- The more complicated two are used to return a user object from a given databse, if the email on the object matches the email passed in as an argument, OR to return a subset of a databse of URLs, if the URL matches a given userId (contained in a cookie, in this case).

## Six EJS files that pertain to all the different web pages that the server can render. 
- Login.ejs displays the login page, where users can enter their email and password to sign in. 
- Registration.ejs displays a page where a new user can sign up with the same info. 
- urls_index is a page that displays stored URLs and their short codes. 
- urls_new is a page where a new full URL can be entered and generates a short code once submitted. 
- urls_show is a page that diplays the newly generated short code for a submitted URL. 
- Finally, _header.ejs is a file that displays a header or toolbar, that is displayed on all other rendered pages as well.
  - It contains a link to submit a new URL, see your stored URLs and codes, as well as displays your logged-in status on the right. 
  - If you are signed in, it will display your email and a logout button. If not, it displays a link to the login and registration pages. 
  
# Finished Product
!["Screenshot of URLs page"](https://github.com/t-smift/tinyApp/blob/main/docs/Screen%20Shot%202022-10-06%20at%206.51.36%20PM.png?raw=true)

!["Screenshot of register page"](https://github.com/t-smift/tinyApp/blob/main/docs/Screen%20Shot%202022-10-06%20at%206.52.05%20PM.png?raw=true)


