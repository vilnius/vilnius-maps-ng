# Express Js server for production on IIS

Express  + EJS is used for index server side rendering: titles, meta tags, Open Graph meta tags, oEmbed attributes

## Express

IISNode must be installed on IIS machine  
server.js script, modules and web.config are stored in production root app directory on IIS  

## EJS

Specific  **view** directory with `index.ejs` file (for production version) is stored in production root app directory on IIS

Following EJS template tags are used in production:

⋅⋅* title  
⋅⋅* description  
⋅⋅* theme image  
⋅⋅* oEmbed url  
