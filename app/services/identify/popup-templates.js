"use strict";
var PopupTemplates = (function () {
    function PopupTemplates() {
    }
    return PopupTemplates;
}());
//curently using getPopUpContent and getPopUpTitle in ProjectsListService
PopupTemplates.itvTemplate = {
    title: '{Pavadinimas}',
    content: "\n      <p><span class=\"n{TemaId}-theme projects-theme\"></span> {Tema} <br /><span>Tema</span></p>\n      <p>{Busena}<br /><span>Projekto b\u016Bsena</span</p>\n      <p>{Projekto_aprasymas} <br /><span>Apra\u0161ymas</span></p>\n      <p>{Igyvend_NUO} - {Igyvend_IKI} m.<br /><span>\u012Egyvendinimo trukm\u0117</span></p>\n      <p><a href=\"{Nuoroda_i_projekta}\" target=\"_blank\">{Nuoroda_i_projekta}</a> <br /><span>Projekto nuoroda</span></p>\n      <p>{Veiksmo_nr_ITVP } <br /><span>Programos veiksmas </span></p>\n      <p>{Vykdytojas}<br /><span>Vykdytojas</span></p>\n      <p><a href=\"{Kontaktai}\">{Kontaktai}</a> <br /><span>Kontaktai</span></p>\n      <div class=\"finance-list\">\n        <div>\n        <p>{Projekto_verte} Eur<br /><span>Projekto vert\u0117</span></p>\n        </div>\n        <p>{ES_investicijos} Eur <br /><span>Europos S\u0105jungos investicijos</span></p>\n        <p>{Savivaldybes_biudzeto_lesos} Eur<br /><span>Savivaldyb\u0117s biud\u017Eeto l\u0117\u0161os</span></p>\n        <p>{Valstybes_biudzeto_lesos} Eur<br /><span>Valstyb\u0117s biud\u017Eeto l\u0117\u0161os</span></p>\n        <p>{Kitos_viesosios_lesos} Eur<br /><span> Kitos vie\u0161osios l\u0117\u0161os</span></p>\n        <p>{Privacios_lesos} Eur<br /><span> Priva\u010Dios l\u0117\u0161os</span></p>\n      </div>\n    ",
    actions: [{
            id: "feature-open",
            //image: "open.png",
            title: "Future VMS actions"
        }]
};
exports.PopupTemplates = PopupTemplates;
//# sourceMappingURL=popup-templates.js.map