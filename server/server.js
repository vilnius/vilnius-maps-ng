const express = require('express');
const url = require('url');
const op = require('./dist/options.js');
const themes = op.MapOptions.themes;
const oembedUrl = 'https://gis.vplanas.lt/oembed/?url=https://maps.vilnius.lt';
const oembedTitle = 'Vilniaus miesto interaktyvūs žemėlapiai';
const oembedDescription = 'Vilniaus miesto savivaldybės interaktyvūs žemėlapiai';
const oembedImg = './app/img/vilnius_logo_o.png';

const app = express();

app.set('view engine', 'ejs');

app.use("/app", express.static(__dirname + '/./app'));
app.use("/dist", express.static(__dirname + '/./dist'));
app.use("/arcgis_js_api", express.static(__dirname + '/./arcgis_js_api'));

app.get('/*', (req, res) => {
  const pathname = url.parse(req.url, parseQueryString = false).pathname;
  if (pathname.slice(1)) {
    for (theme in themes) {
      if (themes[theme].id === pathname.slice(1)) {
        //console.log('\x1b[33m%s\x1b[0m', `themes' id ${themes[theme].id}`);
        res.render('index.ejs', {
          oembedUrl: oembedUrl + req.url,
          oembedDescription: `${themes[theme].description} `,
          oembedTitle: `${themes[theme].name} / ${oembedTitle}`,
          oembedImg: themes[theme].imgUrl
        });
      }

    }

  } else {
    res.render('index.ejs', {
      oembedUrl: oembedUrl + req.url,
      oembedDescription,
      oembedTitle: oembedTitle,
      oembedImg
    });
  }

	// still using legacy maps application with static url routing
	if (pathname.slice(1) !== 'maps_vilnius') {
		// redirect on error to home page
		res.redirect('/');
	}

});

app.listen(process.env.PORT);
