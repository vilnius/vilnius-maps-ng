# Menu components

Basic menu components:
* menu-themes
* menu-layers
* menu-legend
* menu-tools
* menu-open-data


## Menu tools component

Tools list:
* Print tool
* Draw / Buffer / Analyze tool - draw point, line, polygon, optionally add buffer  to any geometry and  make intersect query with any themes layer (only one layer at a time). Raster layers are not included in selection list.


## Todo - Draw / Buffer / Analyze tool:
* Add goto() method after returning query results
* Turn on layer (if layer is not checked) visibility after returning query results
* Default max query results number is set to  1000. Limit results, add message
* Adapt mobile UI for tools menu
