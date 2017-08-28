/*!
 * iOS Assets for Photoshop
 * =============================
 *
 * Version: 1.0.0
 * Author: Yash Shah(Appbirds Technologies)
 * Site: appbirds.co
 * Licensed under the MIT license
 */

// Photoshop variables
var docRef = app.activeDocument,
	activeLayer = docRef.activeLayer,
	activeLayer2,
	docName = docRef.name,
	docPath = docRef.path,	


	resolutionsObj = {
	'@3x': {
		density : 1
	},
	'@2x': {
		density : 0.5153
	},
	'@1x': {
		density : 0.25764896
	},
};
// Initialize
init();

function init() {
    
    // save current ruler unit settings, so we can restore it
    var ru = app.preferences.rulerUnits;
    
    // set ruler units to pixel to ensure scaling works as expected
    app.preferences.rulerUnits = Units.PIXELS;    
    
	if(!isDocumentNew()) {
		for(resolution in resolutionsObj) {
			saveFunc(resolution);
		}
	} else {
		alert("Please save your document before running this script.");
	}

    // restore old ruler unit settings
    app.preferences.rulerUnits = ru;
}

function isDocumentNew(doc){
	// assumes doc is the activeDocument
	cTID = function(s) { return app.charIDToTypeID(s); }
	var ref = new ActionReference();
	ref.putEnumerated( cTID("Dcmn"),
	cTID("Ordn"),
	cTID("Trgt") ); //activeDoc
	var desc = executeActionGet(ref);
	var rc = true;
		if (desc.hasKey(cTID("FilR"))) { // FileReference
		var path = desc.getPath(cTID("FilR"));
		
		if (path) {
			rc = (path.absoluteURI.length == 0);
		}
	}
	return rc;
};


function resizeDoc(document, resolution) {
	var calcWidth  = activeLayer.bounds[2] - activeLayer.bounds[0], // Get layer's width
	calcHeight = activeLayer.bounds[3] - activeLayer.bounds[1]; // Get layer's height

	var newWidth = Math.floor(calcWidth * resolutionsObj[resolution].density);
	var newHeight = Math.floor(calcHeight * resolutionsObj[resolution].density);

	// Resize temp document using Bicubic Interpolation
	resizeLayer(newWidth);

	// Merge all layers inside the temp document
	activeLayer2.merge();
}

function resizeLayer(newWidth) {
	var idImgS = charIDToTypeID( "ImgS" );
	var desc2 = new ActionDescriptor();
	var idWdth = charIDToTypeID( "Wdth" );
	var idPxl = charIDToTypeID( "#Pxl" );
	desc2.putUnitDouble( idWdth, idPxl, newWidth);
	var idscaleStyles = stringIDToTypeID( "scaleStyles" );
	desc2.putBoolean( idscaleStyles, true );
	var idCnsP = charIDToTypeID( "CnsP" );
	desc2.putBoolean( idCnsP, true );
	var idIntr = charIDToTypeID( "Intr" );
	var idIntp = charIDToTypeID( "Intp" );
	var idBcbc = charIDToTypeID( "Bcbc" );
	desc2.putEnumerated( idIntr, idIntp, idBcbc );
	executeAction( idImgS, desc2, DialogModes.NO );
}

function dupToNewFile() {	
	var fileName = activeLayer.name.replace(/\.[^\.]+$/, ''), 
		calcWidth  = Math.ceil(activeLayer.bounds[2] - activeLayer.bounds[0]),
		calcHeight = Math.ceil(activeLayer.bounds[3] - activeLayer.bounds[1]),
		docResolution = docRef.resolution,
		document = app.documents.add(calcWidth, calcHeight, docResolution, fileName, NewDocumentMode.RGB,
		DocumentFill.TRANSPARENT);

	app.activeDocument = docRef;

	// Duplicated selection to a temp document
	activeLayer.duplicate(document, ElementPlacement.INSIDE);

	// Set focus on temp document
	app.activeDocument = document;

	// Assign a variable to the layer we pasted inside the temp document
	activeLayer2 = document.activeLayer;

	// Center the layer
	activeLayer2.translate(-activeLayer2.bounds[0],-activeLayer2.bounds[1]);
}

function saveFunc(resolution) {
	dupToNewFile();
	
	var tempDoc = app.activeDocument;
	
	resizeDoc(tempDoc, resolution);

	var tempDocName = tempDoc.name.replace(/\.[^\.]+$/, ''),
		Ext = decodeURI(tempDoc.name).replace(/^.*\./,''),
		docFolder = Folder(docPath + '/' + docName + '-assets/');

	if(!docFolder.exists) {
		docFolder.create();
	}

	alert(docFolder);
	var saveFile = File(docFolder + "/" + tempDocName + (resolution === '@3x' ? '@3x' : resolution) + ".png");
	var saveFile = File(docFolder + "/" + tempDocName + (resolution === '@2x' ? '@2x' : resolution) + ".png");
	var saveFile = File(docFolder + "/" + tempDocName + (resolution === '@1x' ? '' : resolution) + ".png");
	
	
	var sfwOptions = new ExportOptionsSaveForWeb(); 
	sfwOptions.format = SaveDocumentType.PNG; 
	sfwOptions.includeProfile = false; 
	sfwOptions.interlaced = 0; 
	sfwOptions.optimized = true; 
	sfwOptions.quality = 100;
	sfwOptions.PNG8 = false;

	// Export the layer as a PNG
	activeDocument.exportDocument(saveFile, ExportType.SAVEFORWEB, sfwOptions);

	// Close the document without saving
	activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}
