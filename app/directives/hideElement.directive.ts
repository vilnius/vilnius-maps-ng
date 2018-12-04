import { Directive, HostListener, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[hideElement]'
})
export class HideElementseDirective {
	// not using input at the moment
	@Input() active = true;

	@HostListener('click', ['$event'])
	onClick() {
		this.renderer.setStyle(this.el.nativeElement, 'display', 'none')
 	}

	parent: ElementRef;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

}
