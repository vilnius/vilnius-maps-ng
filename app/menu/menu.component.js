"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var MenuComponent = (function () {
    function MenuComponent() {
        //temporary: Hash toggle, reload, new page,
        window.location.hash = '#';
    }
    MenuComponent.prototype.hash = function (e) {
        if (window.location.hash === e.currentTarget.getAttribute('href')) {
            window.location.hash = '#closed';
            e.preventDefault(); // AG for JQuery same as": return false (in this case, prevents event handlers after click event)
        }
    };
    MenuComponent.prototype.ngOnInit = function () {
        var _this = this;
        //get all anchor elements and run hash
        //create array from array-like object
        this.aTagList = Array.from(document.getElementsByTagName('a'));
        this.aTagList.map(function (a) { return a.addEventListener('click', _this.hash, false); });
        console.log("END");
    };
    return MenuComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], MenuComponent.prototype, "view", void 0);
MenuComponent = __decorate([
    core_1.Component({
        selector: 'menu-map',
        templateUrl: './app/menu/menu.component.html'
    }),
    __metadata("design:paramtypes", [])
], MenuComponent);
exports.MenuComponent = MenuComponent;
//# sourceMappingURL=menu.component.js.map