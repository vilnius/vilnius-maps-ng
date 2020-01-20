import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';
import { IColor } from './QuartersLegend';

@Directive({
  selector: '[mapRgbaColor]'
})
export class RgbaColorDirective implements OnInit {
  @Input() outline: IColor;
  @Input() fill: IColor;

  constructor(private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit() {
    this.renderer.setStyle(this.el.nativeElement, 'border', `1px solid ${this.outline.color}`);
    this.renderer.setStyle(this.el.nativeElement, 'background', `${this.fill.color}`);
  }
}