"use strict";
exports.MapOptions = {
    mapOptions: {
        basemap: 'dark-gray',
        extent: {
            "xmin": 555444.210800001,
            "ymin": 6051736.22,
            "xmax": 606967.016199999,
            "ymax": 6076388.28,
            "spatialReference": {
                "wkid": 3346
            }
        },
        staticServices: {
            basemapUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Baziniai_zemelapiai/Vilnius_basemap_1000/MapServer",
            ortofotoUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Baziniai_zemelapiai/ORT5LT_2013/MapServer",
            geometryUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Utilities/Geometry/GeometryServer"
        },
    },
    themes: {
        itvTheme: {
            custom: true,
            name: "Investiciniai projektai",
            id: "theme-itv",
            imgUrl: "/app/img/statyba.png",
            imgAlt: "Investiciniai projektai",
            layers: {
                //maps layers for scaling on map
                mapLayer: 'https://zemelapiai.vplanas.lt/arcgis/rest/services/TESTAVIMAI/ITV_test_masteliavimas_no_goups_p/MapServer',
                //all projects (converted to polygon) for lsiting and identify features
                uniqueProjects: 'https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/ITV_bendri/MapServer/0',
                //identify map service
                identifyLayer: 'https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/ITV_bendri/MapServer'
            }
        },
        buildings: {
            custom: true,
            name: "Pastatai ir statyba",
            id: "theme-buildings",
            imgUrl: "/app/img/statyba.png",
            imgAlt: "Pastatai ir statyba",
            layers: {
                administravimas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Pastatu_administravimas/MapServer",
                    featureLayerUrls: [
                        "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Pastatu_administravimas/MapServer/1"
                    ]
                }
            }
        },
        advertise: {
            custom: true,
            name: "Reklamos leidimai",
            id: "ad",
            imgUrl: "/app/img/laisvalaikis.png",
            imgAlt: "Reklamos vietos" // image alt attribute
        },
        teritory: {
            name: "Teritorijų planavimas",
            id: "teritory-planning",
            imgUrl: "/app/img/teritorijos.png",
            imgAlt: "Teritorijų planavimas",
            layers: {
                teritorijuPlanavimas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Teritoriju_planavimas/MapServer",
                    name: "Teritorijų planavimas:",
                    isGroupService: true
                }
            }
        },
        teritoryReturn: {
            name: "Žemės grąžinimas",
            id: "teritory-return",
            imgUrl: "/app/img/zeme.png",
            imgAlt: "Teritorijų grąžinimas",
            layers: {
                teritorijuGrazinimas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Zemes_grazinimas/MapServer",
                    name: "Teritorijų grąžinimas:",
                    isGroupService: true
                }
            }
        },
        TeritoryMaintenance: {
            name: "Miesto tvarkymas",
            id: "teritory-maintenance",
            imgUrl: "/app/img/tvarkymas.png",
            imgAlt: "Miesto tvarkymas",
            layers: {
                miestoTvarkymas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Miesto_tvarkymas/MapServer",
                    name: "Miesto tvarkymas:",
                    isGroupService: true
                }
            }
        },
        schools: {
            custom: true,
            name: "Švietimas",
            id: "schools",
            imgUrl: "/app/img/svietimas.png",
            imgAlt: "Švietimas",
            layers: {
                mokyklos: {
                    dynimacLayerUrls: //  dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Mokyklos/MapServer"
                }
            }
        },
        environment: {
            name: "Aplinkosauga",
            id: "env",
            imgUrl: "/app/img/aplinkosauga.png",
            imgAlt: "Aplinkosauga",
            layers: {
                aplinkosauga: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Aplinkosauga/MapServer",
                    name: "Aplinkosauginiai sluoksniai:",
                    isGroupService: true // if layers has grouping in mxd / value for administration purpose only
                }
            }
        },
        publicOffices: {
            name: "Viešos įstaigos",
            id: "public-offices",
            imgUrl: "/app/img/tvarkymas.png",
            imgAlt: "Viešos įstaigos",
            layers: {
                viesosIstaigos: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Viesos_istaigos/MapServer",
                    name: "Viešos įstaigos" // dynamicLayers group name
                }
            }
        },
        cyclingTracks: {
            name: "Transportas / Dviračiai",
            id: "cycling-tracks",
            imgUrl: "/app/img/tvarkymas.png",
            imgAlt: "Transportas / Dviračių takai",
            layers: {
                transportas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Transportas/MapServer",
                    name: "Transportas / Dviračiai:" // dynamicLayers group name
                },
                accidentsRaster: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Eismo_ivykiu_tankumas/MapServer",
                    name: "Eismo įvykių tankumas" // dynamicLayers group name
                }
            }
        },
        leisure: {
            name: "Laisvalaikis",
            id: "laisvalaikis",
            imgUrl: "/app/img/tvarkymas.png",
            imgAlt: "Laisvalaikis",
            layers: {
                wifiZon: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://services1.arcgis.com/usA3lHW20rGU6glp/arcgis/rest/services/juodos_demes/FeatureServer",
                    name: "Laisvalaikis" // dynamicLayers group name
                }
            }
        },
        treeInv: {
            name: "Medžių inventorizacija",
            id: "medziai-inv",
            imgUrl: "/app/img/tvarkymas.png",
            imgAlt: "Medžių inventorizacija",
            layers: {
                wifiZon: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Vilniaus_zeldiniu_perziura_2015/MapServer",
                    name: "Medžių inventorizacija" // dynamicLayers group name
                }
            }
        },
        itv: {
            name: "Investiciniai projektai",
            id: "itv",
            imgUrl: "/app/img/tvarkymas.png",
            imgAlt: "Investiciniai projektai",
            layers: {
                itv_statusas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/ITV_statusas/MapServer",
                    name: "Investiciniai projektai pagal statusą" // dynamicLayers group name
                },
                itv_tema: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/ITV_tema/MapServer",
                    name: "Investiciniai projektai pagal temą" // dynamicLayers group name
                },
                itv_teritorija: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/ITV_teritorijos/MapServer",
                    name: "Investicininių projektų teritorijos" // dynamicLayers group name
                }
            }
        },
        legacyMap: {
            custom: true,
            name: "Senoji žemėlapio versija",
            id: "legacy",
            imgUrl: "/app/img/old_version.png",
            imgAlt: "Senoji versija",
            url: "https://www.vilnius.lt/vmap/t1.php" // external url if required, if not - gets internal url depending on id property
        }
    },
    animation: {
        options: {
            animate: true,
            duration: 600,
            easing: "ease-out" // Possible Values: linear | ease | ease-in | ease-out | ease-in-out
        }
    },
    search: {
        // search widget locator url
        locator: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Lokatoriai/PAIESKA_COMPOSITE/GeocodeServer"
    }
};
//# sourceMappingURL=options.js.map