"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var options_1 = require("../options");
var domConstruct = require("dojo/dom-construct");
var MenuThemesComponent = (function () {
    function MenuThemesComponent() {
    }
    MenuThemesComponent.prototype._getUrlQueryName = function (name, url) {
        if (url === void 0) { url = ''; }
        if (!url)
            url = window.location.href;
        url = url.toLowerCase(); // avoid case sensitiveness
        name = name.replace(/[\[\]]/g, "\\$&").toLowerCase(); // avoid case sensitiveness for query parameter name
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    MenuThemesComponent.prototype.currentTheme = function () {
        return this._getUrlQueryName("theme");
    };
    MenuThemesComponent.prototype.currenthemeLabel = function () {
        var theme = this.currentTheme();
        var themeDom = document.getElementById("theme");
        var themeDomDivs = themeDom.getElementsByTagName("div");
        for (var i = 0; i < themeDomDivs.length; i++) {
            if (themeDomDivs[i].id === theme) {
                themeDomDivs[i].className += " current-theme";
            }
            else {
                //AG else: remove class from element TODO: check if class exists
                themeDomDivs[i].className = themeDomDivs[i].className.replace(/(?:^|\s)current-theme(?!\S)/g, '');
                //AG TEMP default theme #buildings
                if (!theme) {
                    document.getElementById("theme-buildings").className += " current-theme";
                }
            }
        }
    };
    MenuThemesComponent.prototype.createThemeDom = function () {
        var themesObj = options_1.MapOptions.themes;
        var count = 1;
        for (var theme in themesObj) {
            if (themesObj.hasOwnProperty(theme)) {
                var divTag, aTag, pTag, imgTag, alignClass, urlTag;
                divTag = aTag = pTag = imgTag = alignClass = urlTag = null;
                if (themesObj.hasOwnProperty(theme)) {
                    count++;
                    var countMod;
                    countMod = count % 2 > 0 ? alignClass = "align-right" : alignClass = "align-left";
                    //console.log(theme); //ad float: right or left
                    divTag = domConstruct.create("div", { id: themesObj[theme].id, class: "sub-theme " + alignClass, style: "" }, "theme", "last"); //AG static width in px, because we're using overflow-y: auto in main div
                    urlTag = !themesObj[theme].url ? "./?theme=" + themesObj[theme].id : themesObj[theme].url; //check if theme has url defined
                    aTag = domConstruct.create("a", { href: urlTag }, divTag);
                    imgTag = domConstruct.create("img", { src: themesObj[theme].imgUrl, alt: themesObj[theme].imgAlt }, aTag);
                    pTag = domConstruct.create("p", { innerHTML: themesObj[theme].name }, divTag);
                }
            }
        }
    };
    MenuThemesComponent.prototype.ngOnInit = function () {
        //create theme menu elements
        this.createThemeDom();
    };
    return MenuThemesComponent;
}());
MenuThemesComponent = __decorate([
    core_1.Component({
        selector: 'menu-themes',
        template: "\n      <div>\n        <p>Pasirinkite tem\u0105:</p>\n        <a href=\"#theme\" class=\"button close animate\" title=\"U\u017Edaryti\">\u2715</a>\n      </div>\n    "
    })
], MenuThemesComponent);
exports.MenuThemesComponent = MenuThemesComponent;
//# sourceMappingURL=menu-themes.component.js.map