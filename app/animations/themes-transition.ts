import { trigger, animate, style, state, group, query, stagger, transition } from '@angular/animations';

export const themesTransition = trigger('themesTransition', [
  state('home', style({ opacity: 1 })),
  transition('* <=> *', [
		// set elements
    query('.line-animation', style({ transform: 'translateX(-100%)' }), { optional: true }),
    query('.col-xs-6', style({ opacity: 0 }), { optional: true }),
    query('.themes-page-logo', style({ opacity: 0, transform: 'translateY(-100%)' }), { optional: true }),
    query('.anim-trigger', style({ opacity: 0 }), { optional: true }),
		// animate wieth group
		// parallel animation
    group([
      query('.themes-page-logo', animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0%)' }))),
      query('.line-animation', animate('800ms ease-out', style({ transform: 'translateX(0%)' }))),
      query('.anim-trigger', stagger(120, [
        style({ transform: 'translateY(10px)' }),
        animate('300ms ease-in',
          style({ transform: 'translateY(0px)', opacity: 1 })),
      ]), { optional: true }),
      query(':enter .col-xs-6', stagger(60, [
        style({ transform: 'translateY(20px)' }),
        animate('400ms ease-in',
          style({ transform: 'translateY(0px)', opacity: 1 })),
      ]), { optional: true }),
    ])
  ])
])
