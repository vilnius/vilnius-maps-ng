import { Component } from '@angular/core';

@Component({
  selector: 'credits-map',
  styles: [`
      #credits {
          bottom: 0;
          padding: 4px;
          right: 0;
          color: #3A3A3A;
          position: absolute;
          z-index: 1;
          background: rgba(255,255,255,.5);
          font-size: 12px;
          border-radius: 2px;
      }
      #credits a:focus, #credits a:hover {
          color: #3A3A3A;
          padding-top: 6px;
          cursor: pointer;
      }
      `],
  template: `
      <div id="credits">
        {{year | date: "y"}} m.
				<span class="credits-content name">
					| VMS interaktyvūs žemėlapiai </span> |
					<a id='copyright'
						[popper]="'© SĮ Vilniaus planas <br>© Vilniaus miesto savivaldybė<br>ORT5LT © Nacionalinė žemės tarnyba prie ŽŪM<br>© Valstybinė saugomų teritorijų tarnyba prie Aplinkos ministerijos<br>© Policijos departamentas prie Vidaus reikalų ministerijos'"
						[popperTrigger]="'hover'"
						[popperForceDetection]="true"
						[popperPlacement]="'top'"
					>Autorinės teisės</a> <span class="credits-content company">|
					<a href='http://www.vilniausplanas.lt/' target='_blank'>SĮ „Vilniaus planas“</a>
				</span>
      </div>
    `
})

export class CreditsCompponent {
  year = new Date();
}
