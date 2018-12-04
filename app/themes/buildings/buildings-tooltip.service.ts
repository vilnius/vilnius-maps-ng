import { Injectable, ElementRef, Renderer2 } from '@angular/core';

@Injectable()
export class BuildingsTooltipService {

  constructor() { }

  addTooltip(view, mapView, element: ElementRef, rend: Renderer2) {
		const tooltip = rend.createElement('div');
		rend.appendChild(element.nativeElement, tooltip);
		const requestAnimationFrame = window.requestAnimationFrame.bind(window)
		let stop = true;
    const tooltipEvent = mapView.on("pointer-move", (event) => {
      const screenPoint = {
        // hitTest BUG, as browser fails to execute 'elementFromPoint' on 'Document'
        // FIXME bug with x coordinate value, when menu icon is in view, temp solution: change x value from 0 to any value
        x: event.x ? event.x : 600,
        y: event.y
      };

      if (tooltip.textContent.length > 0) {
        tooltip.textContent = '';
        rend.setStyle(tooltip, 'padding', '0px');
      };

      view.hitTest(screenPoint)
        .then((response) => {

					if (response.results.length > 0) {
						stop = false;
						drawTooltip(response, event)
					} else {
						stop = true;
						rend.setProperty(document.body.style, 'cursor', 'auto');
					}
				});
    });

		let moveRaFTimer;
		let x = 0;
		let y = 0;

    function drawTooltip(response, event) {
			if (stop) {
				return;
			}
			function draw(now) {
				console.log("frame timstamp", now);
				const top = (event.y + 100) < window.innerHeight ? window.innerHeight - event.y + 10 + 'px' : window.innerHeight - event.y - 30 + 'px';
				const left = (event.x + 100) < window.innerWidth ? event.x + 20 + 'px' : (event.x - 110) + 'px';
				const values = response.results["0"];
				x += (event.x - x) * 0.5;
				y += (event.y - y)  * 0.5;

				// don't add tooltip in case of stop variable
				// or in case we hit graphic object with no attributes
				if (!stop && values.graphic.attributes) {
					const textMsg = `${values.graphic.attributes.ADRESAS}`;
					tooltip.innerHTML  = textMsg;
					rend.addClass(tooltip, 'buldings-tooltip');
					rend.setStyle(tooltip, 'transform', "translate3d(" + left + ", -" + top + ", 0)");
					rend.setStyle(tooltip, 'padding', '5px');
					rend.setStyle(tooltip, 'display', 'block');
					rend.setProperty(document.body.style, 'cursor', 'pointer');
					if (((Math.abs(x - event.x ) < 1) && (Math.abs(y - event.y ) < 1))) {
						x = event.x;
						y = event.y;
					} else {
						moveRaFTimer = null;
						moveRaFTimer = requestAnimationFrame(draw);
					}
				}
			}
			if (!0) {
				moveRaFTimer = requestAnimationFrame(draw);
			}
    }

    return [tooltipEvent, tooltip];
  }

}
