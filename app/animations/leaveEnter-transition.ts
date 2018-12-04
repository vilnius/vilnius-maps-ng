import { trigger, animate, style, transition } from '@angular/animations';
export const leaveEnterTransition =
	trigger('leaveEnterTransition', [
	     transition(':enter', [
	       style({transform: 'translateY(10px)', opacity: 0}),
	       animate('150ms', style({transform: 'translateY(0)', opacity: 1}))
	     ]),
	     transition(':leave', [
	       style({opacity: 1}),
	       animate('150ms', style({opacity: 0}))
	     ])
	   ]
	 )
