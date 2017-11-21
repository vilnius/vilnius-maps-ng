export class PopupTemplates {
  //curently using getPopUpContent and getPopUpTitle in ProjectsListService
  public static itvTemplate = {
    title: '{Pavadinimas}',
    content: `
      <p><span class="n{TemaId}-theme projects-theme"></span> {Tema} <br /><span>Tema</span></p>
      <p>{Busena}<br /><span>Projekto būsena</span</p>
      <p>{Projekto_aprasymas} <br /><span>Aprašymas</span></p>
      <p>{Igyvend_NUO} - {Igyvend_IKI} m.<br /><span>Įgyvendinimo trukmė</span></p>
      <p><a href="{Nuoroda_i_projekta}" target="_blank">{Nuoroda_i_projekta}</a> <br /><span>Projekto nuoroda</span></p>
      <p>{Veiksmo_nr_ITVP } <br /><span>Programos veiksmas </span></p>
      <p>{Vykdytojas}<br /><span>Vykdytojas</span></p>
      <p><a href="{Kontaktai}">{Kontaktai}</a> <br /><span>Kontaktai</span></p>
      <div class="finance-list">
        <div>
        <p>{Projekto_verte} Eur<br /><span>Projekto vertė</span></p>
        </div>
        <p>{ES_investicijos} Eur <br /><span>Europos Sąjungos investicijos</span></p>
        <p>{Savivaldybes_biudzeto_lesos} Eur<br /><span>Savivaldybės biudžeto lėšos</span></p>
        <p>{Valstybes_biudzeto_lesos} Eur<br /><span>Valstybės biudžeto lėšos</span></p>
        <p>{Kitos_viesosios_lesos} Eur<br /><span> Kitos viešosios lėšos</span></p>
        <p>{Privacios_lesos} Eur<br /><span> Privačios lėšos</span></p>
      </div>
    `,
    actions: [{
      id: "feature-open",
      //image: "open.png",
      title: "Future VMS actions"
    }]
  };
}
