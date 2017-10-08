var canvasXmax=1500;
var canvasYmax=720;
var currentView = 1; //start with detailed view
canvasScale = 0.6;
scaling = canvasScale;
canvasX=canvasXmax*canvasScale;
canvasY=canvasYmax*canvasScale;
var spiecesArr = ["B","C","H","G","O","S"];

var data;
var arrayData;
var idx2;

var currentSort = 'XX';  //original sort = XX no sort : eg GB means sort on group and then on bonobo , t= total
var nbSpecies= 6;
var YlossTop = 10;  //10 pixels die verborgen worden door de taakbalk
var XlossLeft = 8;  //8 pixels die verborgen worden langs links (beeldscherm instelling ??)
// the grid
var gridContainmentXRatio = 3/4; //hoeveel van de x as mag de grid hebben in vergelijking met containment
var lGridX = (canvasX-XlossLeft)*gridContainmentXRatio //totalelengte van grid in X richting
var lGridY = canvasY-YlossTop;
var gridXStart = XlossLeft; // de linkerbovenhoek vanwaar grid begint (zichtbaar)
var gridYStart = YlossTop;
var nbGridItemsX = 10;
var nbGridItemsY=11;
var dGridElY=lGridY/(nbGridItemsY); // ruimte tussen griditems in Y richting
var dGridElX=lGridX/(nbGridItemsX); // ruimte tussen griditems in X richting

var AdHocCorrectionGlyphBottom= dGridElY/2 // snelle fix

var gridPosX=[]; //pixel pos for every griditem eg. gridpos[2] = X pixel pos second column
for (var i=1;i<nbGridItemsX+1;i++){
gridPosX[i]= (dGridElX*i)+XlossLeft - (dGridElX/2)
}
var gridPosY=[]; //pixel pos for every griditem eg. gridpos[2] = Y pixel pos second row
for (var i=1;i<nbGridItemsY+1;i++){
gridPosY[i]= (dGridElY*i)+YlossTop - (dGridElY/2)
}

var gridX=0; //van 1 tem 10, voor dynamische plaatsing
var gridY=0;  //van 1 tem 11, voor dynamische plaatsin
var transientOld=[];
var transientNew=[];


// the containmentregio
var lContX = canvasX-lGridX;
var lContY = canvasY - YlossTop
var lContSpaceLeftRatioX = 0.2;
var lContSpaceLeftX = lContX * lContSpaceLeftRatioX;
var lContSpaceRightRatioX = 0.1		;
var lContSpaceRightX= lContX * lContSpaceRightRatioX;
var lContDiagrX = lContX - lContSpaceLeftX - lContSpaceRightX //X space available for each diagram
var dContY = dGridElY; //distance between 2 diagrams
var nbDiag = 4;
var lContDiagrY = (lContY-((nbDiag+1))*dContY)/nbDiag; // Y space available for each diagram
var contStartX = lGridX + lContSpaceLeftX ; // linkerbovenhoek startpositie voor elk diagramma
var contStartY = [];
for (var i=1;i<nbDiag + 1;i++){
contStartY [i]= (lContDiagrY + dContY)*(i-1) + dContY/2
}
var scale4diagram = 1.5;
var corrXDiag4 = (0.25* lContDiagrX)/scale4diagram; //ad-hoc correctie voor similarity containment
var corrYDiag4 = dContY/scale4diagram;            //ad-hoc correctie voor similarity containment

    //the connector points for connector lines
	var connectpt1 = [contStartX+ (7/8*lContDiagrX),contStartY [1] + (1/2*lContDiagrY)];
	var connectpt2 = [contStartX+ lContDiagrX + lContSpaceRightX/2,contStartY [1] + (1/2*lContDiagrY)];
	
	var connectpt3 = [contStartX+ (6/8*lContDiagrX),contStartY [2] + (1/2*lContDiagrY)];
	var connectpt4 = connectpt2.slice(); connectpt4[1]+=lContDiagrY+dContY;

	var connectpt5 = [contStartX+ (6/8*lContDiagrX),contStartY [3] + (1/2*lContDiagrY)];
	var connectpt6 = connectpt4.slice(); connectpt6[1]+=lContDiagrY+dContY;
	
	var connectpt7 = connectpt6.slice();connectpt7[1]+=lContDiagrY/2;
	
	var connectpt8 = [];connectpt8[0] = contStartX + lContDiagrX/2; connectpt8[1] = contStartY [4] + corrYDiag4;
	
	var connectpt9 = [lGridX,gridPosY[1]];
	var connectpt10 = [contStartX, contStartY[1]+(1/2*lContDiagrY)];
	
	var connectpt11 = [lGridX,(gridPosY[2]+gridPosY[3])/2];
	var connectpt12 = [contStartX, contStartY[2]+(1/2*lContDiagrY)];

	var connectpt13 = [lGridX,gridPosY[7]];
	var connectpt14 = [contStartX, contStartY[3]+(1/2*lContDiagrY)];

//colors
var colVagueExtreme = 244;
var colVague = 230;
var colHalfVague = 150;
var colGridBg = colVagueExtreme;
var alphaColCont= 150;
var colPop = (255,100,alphaColCont);  //to quickly highlight something
var colContI= '(255,0,0)';
var colContII= '(0,255,0)';
var colContIII= '(0,0,255)';


// glyph
var maxRad;  // the maximum distance for every glyph in the grid
if(dGridElY>dGridElX) maxRad = dGridElX/2;
else {maxRad = dGridElY/2;}

var avgRad = maxRad/2;  //the radius of the average circle
var radContrastScale = 3; // this will make the glyph more or less pronounced. use when delta is to small
var distTotal = [];
var d2rad=[];
var speciesarray=['B','C','G','H','O','S'];

// switchBox
var switchBoxStartx = (gridPosX[1]+gridPosX[2])/2 + AdHocCorrectionGlyphBottom/2;
var switchBoxStarty = (gridPosY[10] + gridPosY[11] + AdHocCorrectionGlyphBottom)/2;
var widthBox = dGridElX/4;
var heightBox = widthBox ;
var switchBoxYrange = [switchBoxStarty,switchBoxStarty+heightBox]
switchboxXrange=[];  //will be filled up in the function itself

// sortBox
var sortBoxStartx = switchBoxStartx + (4*widthBox);
var sortBoxStarty = switchBoxStarty;
var sortBoxYrange = [sortBoxStarty,sortBoxStarty+heightBox]
sortBoxXrange=[];  //will be filled up in the function itself

// effectsbox
var effectBoxStartx = sortBoxStartx + (10*widthBox);
var effectBoxStarty = switchBoxStarty;
var effectBoxYrange = [sortBoxStarty,sortBoxStarty+heightBox]
var effectBoxXrange=[];
for(var i = 0; i <5;i++){
effectBoxXrange[i] = effectBoxStartx + i*widthBox}

 // show text or not
var effectBoxICID = 0;
var effectBoxContrast = 0; //counter : effects color of fill and contrast.  increase with right , decrease left mouse
var effectBoxICTrace = 0; //show trace lines or not
var ContrastImpact = 0.4;  //impact of 1 click increase on contrast = level 1 to 5 adhoc finetunen
var effectBoxBringThaFunk =0;
var endcounter=0;

var map_prevPos = {}; //key = tree id, value = prev grid positions 
var map_prevPosRev = {}; // from position to tree
var prevPosValue = [];
var TreeSelectArr = []; //contains all tree id's that are selected
var posXYtemp = [];
var traceCounter = 0;
var map_trace = {};   // map a tree to a tracenumber

function preload() {
data = loadTable("compare_dist_101Trees.csv", "header");
}

function setup() {
  createCanvas(canvasX, canvasY);
  textFont("Helvetica");
  textAlign(CENTER);
  textSize(16*canvasScale);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  angleMode(RADIANS);
  
  
  //DRAWING
  // arrayData = data.getRows();
  
  Z000SetupBackground();
  Z100DrawStructuralDiffTrees();
  Z200DrawGlyphsGrid();
  
}

function draw() {
	if(effectBoxBringThaFunk==1 && endcounter <300){
		if (endcounter <100) {
		
		// textSize+=1;
		
			textSize(120);
		
			fill(255,0,0);stroke(0);		
			text("THE END",300,0+endcounter)
		}
		else{
			if (endcounter>200){
			radContrastScale+=5;
			setup();}
		}
		endcounter ++;
		
		// Z200DrawGlyphsGrid();		
	}
}


function Z000SetupBackground(){

	Z005drawGridContour(); // grid with vague fill
	if (currentSort=='XX' || currentView != 3) Z020drawContainmentLines(); // vague containment lines within grid + fill
	Z010drawGridDots(); //vague dots
	Z025drawConnectorLines(); //vague connector between containments and grid
	switchboxXrange=Z030drawSwitchBox(currentView); //switch view

	if (currentView==3){sortBoxXrange=Z035drawSortBox(currentSort);} //sort view
	
	Z040drawEffectsBox();

		
}
	
	


function Z005drawGridContour(){
	noStroke(); 
	fill(colVagueExtreme);
	beginShape();
	vertex(gridXStart,gridYStart);
	var AdHocCorrectionGlyphBottom= dGridElY/2 // snelle fix
	vertex(gridXStart,lGridY +AdHocCorrectionGlyphBottom);
	vertex((gridPosX[1]+gridPosX[2])/2, lGridY + AdHocCorrectionGlyphBottom);
	vertex((gridPosX[1]+gridPosX[2])/2, (gridPosY[10]+gridPosY[11])/2);
	vertex(lGridX, (gridPosY[10]+gridPosY[11])/2);
	vertex(lGridX, gridYStart);
	endShape(CLOSE);
	reset();
	
}

function Z010drawGridDots(){
	stroke(200);
	strokeWeight(3);
	for (var i=1;i<nbGridItemsX+1;i++){
		for (var j=1;j<nbGridItemsY+1;j++){
			if (j==11 && i>1){}
			else {point(gridPosX[i],gridPosY[j]);}
		}
	}	
}
function Z020drawContainmentLines(){
	stroke(colHalfVague);
	//draw containment of 5
	if (currentView==1){noFill();}
	else {fill(255,0,0,100);} //color group III
	beginShape();
	vertex((gridPosX[8]+gridPosX[7])/2, (gridPosY[2]+gridPosY[1])/2);
	vertex((gridPosX[7]+gridPosX[8])/2,(gridPosY[3]+gridPosY[2])/2);
	vertex((gridPosX[9]+gridPosX[8])/2,(gridPosY[3]+gridPosY[2])/2);
	vertex((gridPosX[9]+gridPosX[8])/2,(gridPosY[3]+gridPosY[4])/2);
	// vertex((gridPosX[7]+gridPosX[8])/2,(gridPosY[4]+gridPosY[3])/2);
	vertex(lGridX,(gridPosY[4]+gridPosY[3])/2);
	vertex(lGridX,(gridPosY[2]+gridPosY[1])/2);
	// vertex((gridPosX[10]+gridPosX[9])/2,(gridPosY[2]+gridPosY[3])/2);
	vertex((gridPosX[10]+gridPosX[9])/2,(gridPosY[2]+gridPosY[1])/2);
	endShape(CLOSE);
	
	//draw containment of 17
	if (currentView==1){noFill();}
	else {fill(0,255,0,100);} //color group II

	beginShape();
	vertex(gridXStart, gridYStart);
	vertex(gridXStart, (gridPosY[2]+gridPosY[3])/2);
	vertex((gridPosX[8]+gridPosX[7])/2, (gridPosY[2]+gridPosY[3])/2);
	vertex((gridPosX[8]+gridPosX[7])/2, (gridPosY[2]+gridPosY[1])/2);
	vertex(lGridX, (gridPosY[2]+gridPosY[1])/2);
	vertex(lGridX, gridYStart);
	endShape(CLOSE);
	
	//draw containment of 73
	if (currentView==1){noFill();}
	else {fill(0,0,255,100);} //color group I
	beginShape();
	vertex(gridXStart, (gridPosY[2]+gridPosY[3])/2);
	
	vertex(gridXStart, lGridY+ AdHocCorrectionGlyphBottom);
	vertex((gridPosX[1]+gridPosX[2])/2, lGridY+ AdHocCorrectionGlyphBottom);
	vertex((gridPosX[1]+gridPosX[2])/2, (gridPosY[11]+gridPosY[10])/2);
	vertex(lGridX, (gridPosY[11]+gridPosY[10])/2);
	vertex(lGridX, (gridPosY[3]+gridPosY[4])/2);
	vertex((gridPosX[8]+gridPosX[9])/2, (gridPosY[3]+gridPosY[4])/2);
	vertex((gridPosX[8]+gridPosX[9])/2, (gridPosY[3]+gridPosY[2])/2);
	endShape(CLOSE);
	reset();
}

function Z025drawConnectorLines(){
	strokeWeight(2);
	line(connectpt1[0],connectpt1[1],connectpt2[0],connectpt2[1]);
	line(connectpt3[0],connectpt3[1],connectpt4[0],connectpt4[1]);
	line(connectpt5[0],connectpt5[1],connectpt6[0],connectpt6[1]);
	
	line(connectpt2[0],connectpt2[1],connectpt7[0],connectpt7[1])
	
	line(connectpt7[0],connectpt7[1],connectpt8[0],connectpt8[1])
	if(currentView!=3 || currentSort=='XX'){
	stroke(0,255,0,100);
	line(connectpt9[0],connectpt9[1],connectpt10[0],connectpt10[1])
	stroke(255,0,0,100);
	line(connectpt11[0],connectpt11[1],connectpt12[0],connectpt12[1])
	stroke(0,0,255,100);
	line(connectpt13[0],connectpt13[1],connectpt14[0],connectpt14[1])}
	reset();
	
	
}

function Z030drawSwitchBox(currentview) {
	x=switchBoxStartx;
	y=switchBoxStarty;
	
	//first box
	if (currentview == '1'){fill(255,0,0,200);}
	else {noFill()}
	rect(x,y,widthBox,heightBox);
	textAlign(CENTER);
	text('1',x + widthBox/2,y+heightBox/2);
	switchboxXrange[0]=x;
	
	//second
	x += widthBox;
	if (currentview == '2'){fill(255,0,0,200);}
	else {noFill()}
	rect(x,y,widthBox,heightBox);
	textAlign(CENTER);
	text('2',x + widthBox/2,y+heightBox/2);
	switchboxXrange[1]=x;
	
	//third
	x += widthBox;
	if (currentview == '3'){fill(255,0,0,200);}
	else {noFill()}
	rect(x,y,widthBox,heightBox);
	textAlign(CENTER);
	text('3',x + widthBox/2,y+heightBox/2);
	switchboxXrange[2]=x;
	
	//endpoint
	x += widthBox;
	switchboxXrange[3]=x
	
	//text label underneath
	textAlign(BOTTOM);
	fill(0);
	text('view',(switchboxXrange[0]+switchboxXrange[3])/2,switchBoxYrange[1]+heightBox/2);
	
	return switchboxXrange
	
}

function Z035drawSortBox(currentSort) {
	// var switchBoxStartx = (gridPosX[1]+gridPosX[2])/2 + AdHocCorrectionGlyphBottom/2;
// var switchBoxStarty = (gridPosY[10] + gridPosY[11] + AdHocCorrectionGlyphBottom)/2;
// var widthBox = dGridElX/4;
// var heightBox = widthBox ;
// var switchBoxYrange = [switchBoxStarty,switchBoxStarty+heightBox]
// switchboxXrange=[];  //will be filled up in the function itself

// sortBox
// var sortBoxStartx = switchBoxStartx + widthBox + dGridElX;
// var sortBoxStarty = switchBoxStarty;
// var switchBoxYrange = [sortBoxStarty,sortBoxStarty+heightBox]
// sortBoxXrange=[];  //will be filled up in the function itself

	x=sortBoxStartx;
	y=sortBoxStarty;
	
	//first box :reset
	fill(0);
	stroke(255);
	strokeWeight(2);
	rect(x,y,widthBox,heightBox);
	textAlign(CENTER);
	text('R',x + widthBox/2,y+heightBox/2);
	sortBoxXrange[0]=x;
	
	noFill();stroke(0);
	//second  groupbox
	x += widthBox;
	if (currentSort.charAt(0)=='G'){fill(255,0,0,200);}
	else {noFill()}
	strokeWeight(4);
	rect(x,y,widthBox,heightBox);
	strokeWeight(1);
	textAlign(CENTER);
	text('Gr',x + widthBox/2,y+heightBox/2);
	sortBoxXrange[1]=x;
	
	//6 speciesboxes 
	strokeWeight(1);
	textAlign(CENTER);
	for (var species in speciesarray) {
		x += widthBox;
		if (currentSort.charAt(1)==speciesarray[species]){fill(255,0,0,200);}
		else {noFill()}
		rect(x,y,widthBox,heightBox);
		text(speciesarray[species],x + widthBox/2,y+heightBox/2);
		sortBoxXrange.push(x);
	}
	
	if (currentSort.charAt(1)=='T'){fill(255,0,0,200);}
	else {noFill()}
	x += widthBox;
	rect(x,y,widthBox,heightBox);
	strokeWeight(1)
	text('Tot',x + widthBox/2,y+heightBox/2);
	sortBoxXrange.push(x);
	
	
	//endpoint
	x += widthBox;
	sortBoxXrange.push(x);
	
	//text label underneath
	textAlign(BOTTOM);
	strokeWeight(1);
	text('sort',(sortBoxXrange[0]+sortBoxXrange[9])/2,sortBoxYrange[1]+heightBox/2);
	
	reset();
	
	return sortBoxXrange
	
}

function Z040drawEffectsBox() {
	fill(255);stroke(0);strokeWeight(1); textAlign(CENTER);
	for(var i = 0;i<3;i++){
		if (i==0 && effectBoxICID==1)fill (255,0,0);
		
		if (i==1) {
			if (effectBoxContrast<0) {fill(0,255,0,10*effectBoxContrast*(-1))}
			else {
				fill(255,0,0,10*effectBoxContrast)
			}
		}
		
		if (i==2) {
			if (effectBoxICTrace==1) {fill(255,0,0);}
			
		}
		rect(effectBoxXrange[i],effectBoxYrange[0],widthBox,heightBox);
		fill(255);
		
		
		text('*',effectBoxXrange[i], effectBoxYrange[0],widthBox,heightBox);
		reset();
		text('effects',(effectBoxXrange[0]+effectBoxXrange[3])/2,effectBoxYrange[1]+heightBox/2);
	}

	
}


function reset(){
	// background(59); DO NOT USE THIS !! paints over the entire screen !!!
	noFill();
	stroke(0);
	strokeWeight(1);
}
	
function Z100DrawStructuralDiffTrees(){
	Z110DrawContainment(contStartX,contStartY[3],lContDiagrX ,lContDiagrY,'1');
	Z110DrawContainment(contStartX,contStartY[2],lContDiagrX ,lContDiagrY,'3');
	Z110DrawContainment(contStartX,contStartY[1],lContDiagrX ,lContDiagrY,'2');
	
	
	Z110DrawContainment(contStartX,contStartY[4],lContDiagrX*scale4diagram ,lContDiagrY*scale4diagram,'4');
}
function Z110DrawContainment(x,y,w,h, typeNr) {
	if (typeNr==4){	x +=corrXDiag4; y += corrYDiag4 }  //ad-hoc correctie
	textSize(32*scaling)
	textShift = 12*scaling;
	if (typeNr=='1' || typeNr=='2'|| typeNr == '3'|| typeNr == '4') { //basictree rep
		fill(255);
		if (typeNr=='4')	 {} else {
			if (typeNr=='1') stroke(0,0,255,100);
			if (typeNr=='2') stroke(0,255,0,100);
			if (typeNr=='3') stroke(255,0,0,100);
			strokeWeight(4);
			rect(x,y,w,h);
			stroke(0);strokeWeight(1);
			}
		
		// first left circle
		switch(typeNr){
			case '3':fill (255);break;
			case '4':fill (0,0,255);;break;
			default:fill(255, 0, 0);break;
		}

		var ell1x = x + w/4;
		if (typeNr=='4') 
		{var ell1y = y} 
		else 
		{var ell1y = y + h/2};
		var ell1h = h;
		var ell1w = w/2;
		ellipse(ell1x,ell1y,ell1w,ell1h)
		
		// first right circle
		if (typeNr=='4'){} 
		else{
			if (typeNr=='3') {fill (0,0,255) }
				else {fill(255);}
			var ell2x = x + 3*w/4;
			var ell2y = ell1y;
			var ell2h = h;
			var ell2w = w/2;
			ellipse(ell2x,ell2y,ell2w,ell2h)}
		
		fill(0);
		if (typeNr=='1') text("S",ell1x,ell1y+textShift)
		if (typeNr=='2') text("O",ell1x,ell1y+textShift)
		
	
		//  first inner left circle
		if (typeNr=='3'||typeNr=='4'){
			switch(typeNr){
				case'3':
				{fill(255, 0, 0);break;}
				case'4':
				{fill(255);break;}
			}
			
			var ell3x = x + 1/8*w;
			var ell3y = ell1y;
			var ell3w = w/4;
			var ell3h = w/4;
			ellipse(ell3x,ell3y,ell3w,ell3h)
			
			fill(0); 
			//text("C",ell4x,ell4y+textShift)
			switch(typeNr){
				case'3':
				{text("S",ell3x,ell3y+textShift);break;}
				case'4':
				{text("G",ell3x,ell3y+textShift);break;}
			}			
			
		//  second inner left circle
			switch(typeNr){
				case'3':
				{fill(255,0,0);break;}
				case'4':
				{fill(0,0,255);break;}
			}
			var ell4x = x + 3/8*w;
			var ell4y = ell1y;
			var ell4w = w/4;
			var ell4h = w/4;
			ellipse(ell4x,ell4y,ell4w,ell4h)
			
			fill(0); 
			switch(typeNr){
				case'3':text("O",ell4x,ell4y+textShift)
			}
			
			if (typeNr=='4'){ // third left circle level3
				fill(255);
				var ell5x = x + 5/16*w;
				var ell5y = ell1y;
				var ell5w = w/8;
				var ell5h = w/8;
				ellipse(ell5x,ell5y,ell5w,ell5h);
				
				fill(0,0,255);
				var ell6x = x + 7/16*w;
				var ell6y = ell1y;
				var ell6w = w/8;
				var ell6h = w/8;
				ellipse(ell6x,ell6y,ell6w,ell6h);
				
				fill(255);
				var ell7x = x + 13/32*w;
				var ell7y = ell1y;
				var ell7w = w/16;
				var ell7h = w/16;
				ellipse(ell7x,ell7y,ell7w,ell7h);
				
				var ell8x = x + 15/32*w;
				var ell8y = ell1y;
				var ell8w = w/16;
				var ell8h = w/16;
				ellipse(ell8x,ell8y,ell8w,ell8h);
				
				
				fill(0); 
				text("H",ell5x,ell5y+textShift)
				textSize(16*scaling)
				text("B",ell7x,ell7y+textShift/2)
				text("C",ell8x,ell8y+textShift/2)
				textSize(32*scaling)
				
				
			}
			
		}
		//2 inner right circles
		else{
			fill(255, 0, 0);
			var ell3x = x + 5/8*w;
			var ell3y = y+ h/2;
			var ell3w = w/4;
			var ell3h = w/4;
			ellipse(ell3x,ell3y,ell3w,ell3h)
			
			fill(0);
			if (typeNr=='1') text("O",ell3x,ell3y+textShift)
			if (typeNr=='2') text("S",ell3x,ell3y+textShift)
			
			fill(0, 0, 255);
			var ell4x = x + 7/8*w;
			var ell4y = y+h/2;
			var ell4w = w/4;
			var ell4h = w/4;
			ellipse(ell4x,ell4y,ell4w,ell4h)
		}
		
		fill(255);
	}
	//return the point for the connector line
	x=[];
	if (typeNr=='3')  {x[0]=ell2x;x[1]=ell2y;} else {x[0]=ell4x;x[1]=ell4y;}
	return x
}


function Z200DrawGlyphsGrid(){
	//step 0  get the avg distances for 6 species, and then calculate d2rad 
	//  (length to radius) for every species
	Z200calcD2radArray();
	
	// get the ID's into order

	arrayData = data.getArray();

		
	arrayData.sort(function(a, b) { 
		if (currentSort[0] == 'G') {
		if (a[14]<b[14]) return 1;
		if (a[14]>b[14]) return -1;
		}
	
		if (currentSort[1]=='X') return 0;
		
		idx2=0;
		for (i in speciesarray){
			if (currentSort[1] == speciesarray[i]) {idx2=int(2+int(i));}
		}
		if (currentSort[1]=='T') {idx2=25};
		
		if (a[idx2]<b[idx2]) return -1;
		if (a[idx2]>b[idx2]) return 1;	
		return 0;
	})
	

	gridX=0;gridY=1;

	

	// map_prevPosFlip = {};
	
	for (var i=0;i<arrayData.length;i++){
		Z210DrawGlyph(arrayData[i][0],currentView);
	}
    
    // map_prevPos = {};
    // for (var i in map_prevPosFlip) {
        // map_prevPos[i] = map_prevPosFlip[i];
    // }
}



function Z200calcD2radArray(){
	var totalRow = data.findRow("GroupTOTAL", "ID");
	distTotal[0] = totalRow.getNum("distB");
	distTotal[1] = totalRow.getNum("distC");
	distTotal[2] = totalRow.getNum("distG");
	distTotal[3] = totalRow.getNum("distH");
	distTotal[4] = totalRow.getNum("distO");
	distTotal[5] = totalRow.getNum("distS");
	
	for(var i = 0;i<nbSpecies;i++) {
		d2rad[i] = (avgRad/distTotal[i]); // vormt distance om naar een relatieve radius
	}
	
	
	
}
		
function Z210DrawGlyph(ID,viewIC){

	//step1 calculate the radii for every direction for first glyph
	//      this is delta, converted to pixels with l2r. then calculate the pixelposition on circle relative to origin
	// var treeRow = data.getRow(1);
	
	var IDstripped =ID.slice(6);
	var treeRow = data.findRow(ID,"ID");
	var scaling = treeRow.getNum('scalefactor');
	prevPosValue = [];
	

	if (treeRow.getString('viewIC') != viewIC) {
		return;} 
	var groupIC = treeRow.getString('groupIC');

	var angle = PI/2; // we start at 12 oclock
	var angleTwist = 2*PI/nbSpecies;  // jumps of 60degrees
	var lRadius = []; //pixellength of the 6 radii
	var lSdRadius = [];
	var lSdRevRadius=[];
	var treeRadiusPosVsOr=[]; // for every species a 2D array with X and Y distance to origin of glyph(rotation from 12h clockwise)
	var sdRadiusPosVsOr=[];
	var sdRadiusRevPosVsOr=[]; //de sd die naar binnen wijst, ipv naar buiten
	var contrast  = 0;
	avgCircle=[];
	for(var i = 0;i<nbSpecies;i++) {
		lRadius[i] = (treeRow.getNum(2+i)*d2rad[i]) 
		lRadius[i] += (lRadius[i]-avgRad)*radContrastScale // scaling van het verschil:contrast vergroten
		lRadius[i] *=scaling ;// general scalingfactor
		
		lSdRadius[i]  = treeRow.getNum(join(['sd',speciesarray[i]],'')) //start met sd unaltered
		
		lSdRadius[i] *= d2rad[i]; // omzetten naar radiuslengte per species
		lSdRadius[i] *= scaling*radContrastScale ;  //algemene scaling,we pakken2standaard deviaties
		if(lSdRadius[i]<0)lSdRadius[i]=0;
		if(lRadius[i]<0) lRadius[i]=0
		lSdRevRadius[i]=lRadius[i]-lSdRadius[i]
		lSdRadius[i] += lRadius[i]; // we laten sd vetrekken vanaf het lradiuspunt
		
		
		avgCircle[i]= [cos(angle-(angleTwist*i))*avgRad , 
		               sin(angle-(angleTwist*i))*avgRad]
		avgCircle[i] *=	scaling ;		   
					   
		treeRadiusPosVsOr[i] = [cos(angle-(angleTwist*i))*lRadius[i] , 
		               -sin(angle-(angleTwist*i))*lRadius[i]] ;
					   
		sdRadiusPosVsOr[i] = [cos(angle-(angleTwist*i))*lSdRadius[i] , 
		               -sin(angle-(angleTwist*i))*lSdRadius[i]] ;
		sdRadiusRevPosVsOr[i] = [cos(angle-(angleTwist*i))*lSdRevRadius[i] , 
		               -sin(angle-(angleTwist*i))*lSdRevRadius[i]] ;	
		
	}

	
	
	//step 2a translate first to the origin
	push();
	noFill;
	var translateX;
	var translateY;
	if (viewIC!=3 || currentSort == 'XX'){   // we use the layout of the excel = the default
		translateX = gridPosX[floor(treeRow.getNum('GridX'))];
		translateY = gridPosY[floor(treeRow.getNum('GridY'))];
		if (floor(treeRow.getNum('GridX')) != treeRow.getNum('GridX')){
			translateX += gridPosX[floor(treeRow.getNum('GridX')) + 1];
			translateX *= 0.5;
		}
		if (floor(treeRow.getNum('GridY')) != treeRow.getNum('GridY')){
		translateY += gridPosY[floor(treeRow.getNum('GridY')) + 1];
		translateY *= 0.5;
		}
	}
	else {
		gridX++;
		if(gridX>10){gridX=1;gridY++}
		translateX = gridPosX[gridX];
		translateY = gridPosY[gridY];
		
	}
	
		//add previous position for tracing // untranslated positions !
	// if (TreeSelectArr.indexOf(IDstripped) != -1) {
	if (IDstripped in map_prevPos) {   
		posXYtemp = map_prevPos[IDstripped];
		posXYtemp.push([translateX,translateY]);
		map_prevPos[IDstripped] = posXYtemp;
		var l = posXYtemp.length;
		switch (map_trace[IDstripped]%3) {
		case 1: 
			stroke(0,255,0);
			break;
		case 2:
			stroke(0,0,255);break;
			
		case 0: 
			stroke(255,0,0);break;
		}
		
		if (l > 1 && effectBoxICTrace==1){line(posXYtemp[l-2][0],posXYtemp[l-2][1],translateX,translateY)}
	}
	// }
	prevPosValue[0]=gridX;prevPosValue[1]=gridY;
	map_prevPosRev[prevPosValue]= IDstripped;
	
	
	if (currentView==3){
			transientNew.push([translateX,translateY]);}
			
	
	translate(translateX,translateY);


	
	//step2aaa fill rectangle with appropriate groupcolor
	if (viewIC==3 && currentSort != 'XX'){
		switch (groupIC) {
			case 'III':fill(255,0,0,100);break; // color groupIII
			case 'II':fill(0,255,0,100);break;// color groupIII
			case 'I':fill(0,0,255,100);break;// color groupIII
		}
		strokeWeight(0);
		if (effectBoxICTrace==1){
			fill(255,20);
			if (IDstripped in map_prevPos){
				strokeWeight(1);
					switch (map_trace[IDstripped]%3) {
		case 1: 
			stroke(0,255,0);
			break;
		case 2:
			stroke(0,0,255);break;
			
		case 0: 
			stroke(255,0,0);break;
		}}}
		
		rect(-dGridElX/2,-dGridElY/2,dGridElX,dGridElY);
		fill(255);
	}
	// if(effectBoxBringThaFunk==1){text("THE END",-dGridElX/2,-dGridElY/2)}
	//step2aa draw background avg circle	noFill();
	strokeWeight(1);
	stroke(0);
	ellipse(0,0,2*avgRad*scaling,2*avgRad*scaling);

	//step2b draw the glyph
	strokeWeight(1);
	beginShape();
	fill(255,0,0,100);
	for(var i = 0;i<nbSpecies;i++) {
		// text('i',treeRadiusPosVsOr[i][0],treeRadiusPosVsOr[i][1]);
		// point (treeRadiusPosVsOr[i][0],treeRadiusPosVsOr[i][1]);
		vertex(treeRadiusPosVsOr[i][0],treeRadiusPosVsOr[i][1]);
	}
	endShape(CLOSE);
	
	
	//step2c draw the  average circle
	beginShape();
	fill(0,0,255);
	strokeWeight(1);
	for(var i = 0;i<nbSpecies;i++) {
		point(avgCircle[i][0],avgCircle[i][1]);
		if (viewIC!=3) line(sdRadiusPosVsOr[i][0],sdRadiusPosVsOr[i][1],sdRadiusRevPosVsOr[i][0],sdRadiusRevPosVsOr[i][1]);
		// if (viewIC!=3) line(sdRadiusPosVsOr[i][0],sdRadiusPosVsOr[i][1],treeRadiusPosVsOr[i][0],treeRadiusPosVsOr[i][1]);
		if(viewIC==1&&effectBoxICID==1) text(spiecesArr[i],sdRadiusPosVsOr[i][0],sdRadiusPosVsOr[i][1]);
	}
	endShape(CLOSE);
	
	//step2d mark center
	point(0,0)
	
	//step2e show id
	textSize(7);
	strokeWeight(1);
	stroke(0);
	if (effectBoxICID ==1&& viewIC==3){
		// verticalText(ID.slice(6),-2*avgRad,-2*avgRad);
		text((ID.slice(6)),-2*avgRad,-1*avgRad);
	}
	
	// highlight selected tree
	if (IDstripped in map_prevPos) {
		fill(255);
		rect(dGridElX/4,-dGridElY/2,dGridElX/4,dGridElY/4);
		fill(0);text("*",dGridElX/4,-dGridElY/2,dGridElX/4,dGridElY/4);

	}
	
	

	//restore and pop
	
	pop();
	

}



function verticalText(input, x, y) {
  var output = "";  // create an empty string
 
  for (var i = 0; i < input.length; i += 1) {
    output += input.charAt(i) + "\n"; // add each character with a line break in between
  }
 
  push(); // use push and pop to restore style (in this case the change in textAlign) after displaing the text 
  textAlign(CENTER, TOP); // center the characters horizontaly with CENTER and display them under the provided y with TOP
  text(output, x, y); // display the text
  pop();
}


function mouseClicked() {

	if (mouseY> switchBoxYrange[0] && mouseY<switchBoxYrange[1]){
		if (mouseX >switchboxXrange[0]) {
			if (mouseX<switchboxXrange[3]){
				mouseClickedSwitchBox();
				return;
			}		
			if (mouseX<sortBoxXrange[9]) {// 9sortboxjes, dus 10 entrees in xrange
				mouseClickedSortbox();
				return;						
			}
			if (mouseX<effectBoxXrange[4]){// 9sortboxjes, dus 10 entrees in xrange{
				mouseClickedEffectBox();
				setup();
				return;
				
			}				
		}
	}
		
	var XitemClick = floor((mouseX-XlossLeft)/dGridElX) + 1 
	var YitemClick = floor((mouseY-YlossTop)/dGridElY) + 1

	
	if(XitemClick<11 && YitemClick<12){
		if (YitemClick==11 && XitemClick>1) {return}
		else{
			var key = [XitemClick,YitemClick];

			var treeID = map_prevPosRev[key];
			if (treeID in map_prevPos){
				delete map_prevPos[treeID];
				delete map_trace[treeID];
				traceCounter--;
				}
			else {
				map_prevPos[treeID] = [];
				traceCounter++; 
				map_trace[treeID]=traceCounter}
			
			setup();
		}
	}
}



String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}
	
function mouseClickedSwitchBox(){
	if (mouseX > switchboxXrange[2]){
		if (currentView!=3){
			currentView=3;
			// remove();
			setup();
		}
		return;
	}
	if(mouseX > switchboxXrange[1])	{
		if (currentView!=2){
			currentView=2;
			// remove();
			setup();
		}
		return;
	}
	if(mouseX > switchboxXrange[0])	{
		if (currentView!=1){
			currentView=1;
			// remove();
			setup();
		}
		return;
	}
}

function mouseClickedSortbox(){

	if (mouseX > sortBoxXrange[8]){
			if (currentSort[1]!='T'){
				currentSort=currentSort.replaceAt(1, "T");
				setup();
			}
			return;
	}
	
	for (var i=0;i<6;i++){

			if (mouseX > sortBoxXrange[7-i]){
				if (currentSort[1]!=speciesarray[5-i]){
				currentSort=currentSort.replaceAt(1, speciesarray[5-i]);
				setup();
				}
				return;
			}
	}
	
	if (mouseX > sortBoxXrange[1]){

			if (currentSort[0]!='G'){
				currentSort=currentSort.replaceAt(0, "G");
				setup();
			}
			else {
				currentSort=currentSort.replaceAt(0, "X");
				setup();
			}

				
			return;	
	}
	
	if (mouseX > sortBoxXrange[0]){  //reset button
			currentSort='XX';
			effectBoxContrast=0;
			radContrastScale = 3;
			effectBoxICTrace=0;
			effectBoxICID==0;
			// TreeSelectArr=[];
			for (p in map_prevPos) {delete map_prevPos[p];}
			setup();
			return;		
	}
}

function mouseClickedEffectBox(){
	if (mouseX > effectBoxXrange[3]){
		console.log("THE MOTHERSHIP HAS LANDED !!!");
		effectBoxBringThaFunk = 1;
		currentView=3;
		return;
	}
	
	if (mouseX > effectBoxXrange[2]){
		if(effectBoxICTrace==1) {
			effectBoxICTrace=0;
			}
		else{
			effectBoxICTrace=1;
			}
		
		return;
	}
	
	if (mouseX > effectBoxXrange[1]){
		if (mouseY > (switchBoxYrange[0] + switchBoxYrange[1])/2){
		effectBoxContrast++;}
		else {effectBoxContrast--;}
		// radContrastScale += ContrastImpact;
		radContrastScale = 3 + (ContrastImpact*effectBoxContrast);
		if (radContrastScale<0) {radContrastScale=0}
		return;
	}
	
	if (mouseX > effectBoxXrange[0]){
		if(effectBoxICID==1) {
			effectBoxICID=0;
			}
		else{
			effectBoxICID=1;
			}	

		return;
	}	
}

