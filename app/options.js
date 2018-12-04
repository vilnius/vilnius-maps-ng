"use strict";
exports.__esModule = true;
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
            //for basemaps const check basemaps.ts in map-widgets folder
            basemapUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Baziniai_zemelapiai/Vilnius_basemap_1000/MapServer",
            basemapDarkUrl: "https://atviras.vplanas.lt/arcgis/rest/services/Baziniai_zemelapiai/Vilnius_basemap_dark_LKS/MapServer",
            ortofotoUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Baziniai_zemelapiai/ORT5LT_2016/MapServer",
            basemapEngineeringUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services//Baziniai_zemelapiai/Vilnius_Inzinerija/MapServer",
            geometryUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Utilities/Geometry/GeometryServer",
            //printServiceUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/ITV_teritorijos/ITV_teritorijos_spausdinimas/GPServer/Export%20Web%20Map"
            printServiceUrl: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Interaktyvus_Default/GPServer/Export%20Web%20Map",
            //allLayers group service for displaying all layers
            commonMaps: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Bendras/MapServer"
        }
    },
    themes: {
        buildingsAdministration: {
            url: "https://maps.vilnius.lt/maps_vilnius/?theme=theme-buildings",
            production: true,
            custom: true,
            name: "Pastatų administravimas",
            //id: "theme-buildings", //theme id class and theme URL query name
            id: "pastatu-administravimas",
            imgUrl: "./app/img/pastatu-administravimas.png",
            imgAlt: "Pastatų administravimas",
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
        buildings: {
            production: true,
            custom: true,
            name: "Pastatai",
            description: "Gyvenamųjų pastatų šilumo suvartojimo informacija, faktinio energijos suvartojimo klasės, mėnesiniai šilumos suvartojimai pagal mokėjimus už šilumą",
            //id: "theme-buildings", //theme id class and theme URL query name
            id: "pastatai",
            imgUrl: "./app/img/pastatai.png",
            imgAlt: "Pastatai",
            layers: {
                silumosSuvartojimas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Pastatai_statyba/MapServer",
                    name: "Pastatai"
                }
            }
        },
        itvTheme: {
            production: true,
            version: "arcgis4",
            hide: false,
            custom: true,
            name: "Investiciniai projektai",
            description: "Interaktyvus investicinių projektų žemėlapis yra skirtas Vilniaus gyventojams ir miesto svečiams patogiai ir išsamiai susipažinti su naujausia informacija apie mieste planuojamus, vykdomus ir jau įgyvendintus investicinius projektus",
            id: "projektai",
            imgUrl: "./app/img/projektai.png",
            imgAlt: "Investiciniai projektai",
            info: "Uses static menu legend",
            layers: {
                //maps layers for scaling on map
                mapLayer: 'https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/itv_projects_GDB/MapServer',
                //all projects (converted to polygon) for listing
                uniqueProjects: 'https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/itv_projects_common_GDB/MapServer',
                //2 base teritories south and north
                teritories: 'https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/itv_teritories/MapServer',
                //identify map service
                identifyLayer: 'https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/ITV_bendri/MapServer',
                name: 'Investiciniai projektai'
            }
        },
        advertise: {
            url: "https://maps.vilnius.lt/maps_vilnius/?theme=ad",
            production: true,
            custom: true,
            name: "Reklamos leidimai",
            id: "leidimai",
            imgUrl: "./app/img/reklamos.png",
            imgAlt: "Reklamos vietos" // image alt attribute
        },
        schools: {
            url: "https://maps.vilnius.lt/maps_vilnius/?theme=schools",
            production: true,
            custom: true,
            name: "Švietimas",
            //id: "schools", //theme id class and theme URL query name
            id: "svietimas",
            imgUrl: "./app/img/mokyklos.png",
            imgAlt: "Švietimas",
            layers: {
                mokyklos: {
                    dynimacLayerUrls: //  dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Mokyklos/MapServer"
                }
            }
        },
        kindergartens: {
            production: true,
            custom: true,
            name: "Darželiai",
            //id: "theme-buildings", //theme id class and theme URL query name
            description: "Ikimokyklinių ugdymo įstaigų (darželių, privačių darželių, kitų įstaigų) paieška pagal gyvenamąjį adresą, tipą, kalbą ar grupės amžių",
            id: "darzeliai",
            imgUrl: "./app/img/darzeliai.png",
            imgAlt: "Darželiai",
            layers: {
                darzeliai: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Darzeliai/MapServer",
                    name: "Darželiai"
                }
            }
        },
        teritory: {
            production: true,
            name: "Planavimas ir statyba",
            //id: "teritory-planning", //theme id class and theme URL query name
            description: "Teritorijų planavimo ir statybų temoje rasite informaciją apie šių sluoksnių grupes: kaimynijos, bendrasis planas, teritorijų planavimo registras, detalieji planai, koncepcijos, gatvių kategorijos, raudonosios linijos, leidimai statyti, inžineriniai projektai, specialūs planai, nomenklatūra, gyventojų tankumas",
            id: "teritoriju-planavimas",
            imgUrl: "./app/img/teritorijos.png",
            imgAlt: "Teritorijų planavimas",
            layers: {
                teritorijuPlanavimas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Teritoriju_planavimas/MapServer",
                    name: "Teritorijų planavimas ir statyba:",
                    isGroupService: true,
                    opacity: 0.9
                }
            }
        },
        teritoryReturn: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=teritory-return",
            production: true,
            name: "Žemės grąžinimas",
            //id: "teritory-return", //theme id class and theme URL query name
            description: "Teritorijų grąžinimo temoje rasite informaciją apie valstybinius žemės plotus, žemės gražinimą /atkūrimą, specialiuosius planus",
            id: "zemes-grazinimas",
            imgUrl: "./app/img/zeme.png",
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
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=teritory-maintenance",
            production: true,
            name: "Miesto tvarkymas",
            //id: "teritory-maintenance", //theme id class and theme URL query name
            description: "Miesto tvarkymo temoje rasite informaciją apie šių sluoksnių grupes: gatvių priežūra, gatvių ir pėsčiųjų takų tvarkymo darbai, tvarkomos miesto teritorijos, medžių inventorizacija, atliekų tvarkymas",
            id: "miesto-tvarkymas",
            imgUrl: "./app/img/miesto-tvarkymas.png",
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
        environment: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=env",
            production: true,
            name: "Aplinkosauga",
            //id: "env", //theme id class and theme URL query name
            description: "Aplinkosaugos temoje rasite informaciją apie šių sluoksnių grupes: triukšmo sklaida, tyliosios triukšmo ir prevencinės zonos, oro tarša, dugno nuosėdos, paviršinio vandens tarša, uždarytų savartynų tarša",
            id: "aplinkosauga",
            imgUrl: "./app/img/aplinkosauga.png",
            imgAlt: "Aplinkosauga",
            layers: {
                aplinkosauga: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Aplinkosauga/MapServer",
                    name: "Aplinkosauginiai sluoksniai:",
                    opacity: 0.7,
                    isGroupService: true // if layers has grouping in mxd / value for administration purpose only
                }
            }
        },
        publicOffices: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=public-offices",
            production: false,
            name: "Viešos įstaigos",
            //id: "public-offices", //theme id class and theme URL query name
            id: "viesosios-istaigos",
            imgUrl: "./app/img/tvarkymas.png",
            imgAlt: "Viešos įstaigos",
            layers: {
                viesosIstaigos: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Viesos_istaigos/MapServer",
                    opacity: 0.6,
                    name: "Viešos įstaigos" // dynamicLayers group name
                }
            }
        },
        cyclingTracks: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=cycling-tracks",
            production: true,
            name: "Transportas / Dviračiai",
            //id: "cycling-tracks", //theme id class and theme URL query name
            description: "Transporto temoje rasite informaciją apie rinkliavos zonas, kiss and ride stoteles, vaizdo stebėsenos vietas, viešąjį transportą, dviračių trasas, eismo įvykius",
            id: "transportas",
            imgUrl: "./app/img/dviraciai.png",
            imgAlt: "Transportas / Dviračiai",
            layers: {
                // accidentsRaster: { // layer unique name //
                //   dynimacLayerUrls:  // dynamicService URL, only 1 url per uniquer Layer
                //   "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Eismo_ivykiu_tankumas/MapServer",
                //   name: "Eismo įvykių tankumas", // dynamicLayers group name
                //   opacity: 0.7,
                //   isRaster: true //is layer Ratser , do not identify layer if true / default value is false
                // },
                transportas: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Transportas/MapServer",
                    name: "Transportas / Dviračiai:",
                    opacity: 0.9
                }
            }
        },
        leisure: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=laisvalaikis",
            production: true,
            name: "Laisvalaikis",
            description: "Laisvalaikio temoje rasite informaciją apie atviras sales, viešuosius tualetus, jaunimo veiklą, pėsčiųjų trasas",
            id: "laisvalaikis",
            imgUrl: "./app/img/laisvalaikis.png",
            imgAlt: "Laisvalaikis",
            layers: {
                laisvalaikis: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Laisvalaikis/MapServer",
                    name: "Laisvalaikis" // dynamicLayers group name
                }
            }
        },
        publicCaffes: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=caffee",
            production: true,
            name: "Lauko kavinės",
            //id: "caffee", //theme id class and theme URL query name
            description: "Lauko kavinių temoje rasite informaciją apie lauko kavines, jų užimamus plotus, leidimus",
            id: "kavines",
            imgUrl: "./app/img/kavines.png",
            imgAlt: "Lauko kavinės",
            layers: {
                publicCaf: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/lauko_kavines/MapServer",
                    name: "Lauko kavinės" // dynamicLayers group name
                }
            }
        },
        civilSecurity: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=civ-sauga",
            production: true,
            name: "Civilinė sauga",
            //id: "civ-sauga", //theme id class and theme URL query name
            description: "Civilinės saugos temoje rasite informaciją apie gyventojų perspėjimo sirenas, kolektyvinės apsaugos statinius, gyventojų evakuavimo punktus",
            id: "civiline-sauga",
            imgUrl: "./app/img/civiline-sauga.png",
            imgAlt: "Civilinė sauga",
            layers: {
                publicCaf: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Civiline_sauga/MapServer",
                    opacity: 0.8,
                    name: "Civilinė sauga" // dynamicLayers group name
                }
            }
        },
        elderships: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=civ-sauga",
            production: true,
            name: "Seniūnijos",
            //id: "civ-sauga", //theme id class and theme URL query name
            description: "Seniūnijų temoje rasite informaciją apie seniūnijų ribas, būstines, seniūnaitijas, kaimynijas, planuojamus miesto tvarkymo darbų",
            id: "seniunijos",
            imgUrl: "./app/img/seniunijos.png",
            imgAlt: "Seniūnijos",
            layers: {
                elderships: {
                    dynimacLayerUrls: // dynamicService URL, only 1 url per uniquer Layer
                    "https://zemelapiai.vplanas.lt/arcgis/rest/services/Interaktyvus_zemelapis/Seniunijos/MapServer",
                    opacity: 1,
                    name: "Seniūnijos" // dynamicLayers group name
                }
            }
        },
        legacyMap: {
            production: false,
            custom: true,
            name: "Senoji žemėlapio versija",
            id: "legacy",
            imgUrl: "/app/img/old_version.png",
            imgAlt: "Senoji versija",
            url: "http://www.vilnius.lt/vmap/t1.php" // external url if required, if not - gets internal url depending on id property
        },
        emptyTeam: {
            //url: "https://maps.vilnius.lt/maps_vilnius/?theme=civ-sauga",
            production: true,
            hide: true,
            name: "Tuščia tema",
            //id: "civ-sauga", //theme id class and theme URL query name
            id: "empty",
            imgUrl: "./app/img/civiline-sauga.png",
            imgAlt: "Tuščia tema" // image alt attribute
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
        locator: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Lokatoriai/PAIESKA_COMPOSITE/GeocodeServer",
        addressLocator: "https://zemelapiai.vplanas.lt/arcgis/rest/services/Lokatoriai/ADRESAI/GeocodeServer"
    },
    maintenance: {
        msg: 'Puslapis laikinai nepasiekiamas - vykdomi priežiūros darbai. Atsiprašome už nepatogumus'
    },
    notFound: {
        msg: 'Astiprašome, toks puslapis neegzistuoja'
    }
};
//additionl themes mapOptions
exports.HeatingDataValues = {
    color: {
        green: 'rgba(167, 206, 39, 0.8)',
        yellow: 'rgba(249, 212, 31, 0.8)',
        orange: 'rgba(245, 143, 58, 0.8)',
        red: 'rgba(225, 8, 39, .8)',
        purple: 'rgba(148, 39, 105, .8)'
    },
    label: {
        label1: 'Gera (1-3)',
        label2: 'Vidutinė (4-5)',
        label3: 'Bloga (6-8)',
        label4: 'Labai bloga (9-11)',
        label5: 'Ypatingai bloga (12-15)'
    }
};
