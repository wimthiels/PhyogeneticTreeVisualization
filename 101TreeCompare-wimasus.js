var canvasXmax=1500;
var canvasYmax=720;
var currentView = 3; //start with detailed view
canvasScale = 0.6;
scaling = canvasScale;
console.log('begin SCRIPT');
canvasX=canvasXmax*canvasScale;
canvasY=canvasYmax*canvasScale;

var data;

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

function preload() {
data = loadTable("compare_dist_101Trees.csv", "header");
}

function setup() {
  console.log('begin setup() with view =>', currentView);
  createCanvas(canvasX, canvasY);
  textFont("Helvetica");
  textAlign(CENTER);
  textSize(16*canvasScale);
  strokeJoin(ROUND);
  strokeCap(ROUND);
  angleMode(RADIANS);
  
  //DRAWING
  Z000SetupBackground();
  Z100DrawStructuralDiffTrees();
  Z200DrawGlyphsGrid();
  
}



	
function draw() {
	//step1 1_SetupBackground
	console.log('loop draw');
	
	// line(0,0,canvasX,canvasY);text('end of draw',8,10);
	// ellipse(0,0,50,50);
	// console.log(gridPosX)
}

function Z000SetupBackground(){

	Z005drawGridContour(); // grid with vague fill
	Z020drawContainmentLines(); // vague containment lines within grid
	Z010drawGridDots(); //vague dots
	Z025drawConnectorLines(); //vague connector between containments and grid
	switchboxXrange=Z030drawSwitchBox(currentView); //switch view
	// console.log(switchboxXrange,'switchboxXrange');
	
	
}

function Z005drawGridContour(){
	console.log('begin Z005drawGridContour')
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
		// console.log('TEST');
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
	else {fill(255,0,0,100);}
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
	else {fill(0,255,0,100);}

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
	else {fill(0,0,255,100);}
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
	strokeWeight(1);
	line(connectpt1[0],connectpt1[1],connectpt2[0],connectpt2[1]);
	line(connectpt3[0],connectpt3[1],connectpt4[0],connectpt4[1]);
	line(connectpt5[0],connectpt5[1],connectpt6[0],connectpt6[1]);
	
	line(connectpt2[0],connectpt2[1],connectpt7[0],connectpt7[1])
	
	line(connectpt7[0],connectpt7[1],connectpt8[0],connectpt8[1])
	
	stroke(0,255,0,100);
	line(connectpt9[0],connectpt9[1],connectpt10[0],connectpt10[1])
	stroke(255,0,0,100);
	line(connectpt11[0],connectpt11[1],connectpt12[0],connectpt12[1])
	stroke(0,0,255,100);
	line(connectpt13[0],connectpt13[1],connectpt14[0],connectpt14[1])
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
	
	return switchboxXrange
	
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
	// console.log('typenr=>',typeNr);
	if (typeNr=='1' || typeNr=='2'|| typeNr == '3'|| typeNr == '4') { //basictree rep
		fill(255);
		if (typeNr=='4')	 {} else {rect(x,y,w,h);}
		
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
	var ID_array = data.getColumn('ID');
	console.log('in Z200DrawGlyphsGrid() with current view -> ', currentView);
	for (var i=0;i<ID_array.length;i++){
		Z210DrawGlyph(ID_array[i],currentView,'showID');}
	
	// if(currentView=='3') {	
		// for (var i=0;i<ID_array.length;i++){
			// Z210DrawGlyph(ID_array[i],currentView,'showID');
		// }
	// }
	// if(currentView=='2') {
		// Z210DrawGlyph(ID_array[i],currentView,'showID');
	// }	
	// if(currentView=='1') {
		// Z210DrawGlyph(ID_array[i],currentView,'showID');
	// }	
}

function Z200calcD2radArray(){
	console.log('starting Z200calcD2radArray()');
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
		
function Z210DrawGlyph(ID,viewIC,showID){
	console.log('starting Z210DrawGlyph()');
	//step1 calculate the radii for every direction for first glyph
	//      this is delta, converted to pixels with l2r. then calculate the pixelposition on circle relative to origin
	// var treeRow = data.getRow(1);
	
	var treeRow = data.findRow(ID,"ID");
	var scaling = treeRow.getNum('scalefactor');
	// console.log(treeRow,'treerow')
	if (treeRow.getString('viewIC') != viewIC) {
		// console.log(ID,'skipping this ID')
		return;} 
	
	// console.log(treeRow.getString('ID'),'ID');
	// console.log(treeRow.getNum('distS'),'treerow distS');
	
	var angle = PI/2; // we start at 12 oclock
	var angleTwist = 2*PI/nbSpecies;  // jumps of 60degrees
	var lRadius = []; //pixellength of the 6 radii
	var lSdRadius = []
	var treeRadiusPosVsOr=[]; // for every species a 2D array with X and Y distance to origin of glyph(rotation from 12h clockwise)
	var sdRadiusPosVsOr=[];
	var contrast  = 0;
	avgCircle=[];
	for(var i = 0;i<nbSpecies;i++) {
		lRadius[i] = (treeRow.getNum(2+i)*d2rad[i]) 
		lRadius[i] += (lRadius[i]-avgRad)*radContrastScale // scaling van het verschil:contrast vergroten
		lRadius[i] *=scaling ;// general scalingfactor
		
		lSdRadius[i] = treeRow.getNum(join(['dist',speciesarray[i]])*d2rad[i] + lRadius[i]; // we laten sd vetrekken vanaf het lradiuspunt
		
		avgCircle[i]= [cos(angle-(angleTwist*i))*avgRad , 
		               sin(angle-(angleTwist*i))*avgRad]
		avgCircle[i] *=	scaling ;		   
					   
		treeRadiusPosVsOr[i] = [cos(angle-(angleTwist*i))*lSdRadius[i] , 
		               -sin(angle-(angleTwist*i))*lSdRadius[i]] ;
					   
		sdRadiusPosVsOr[i] = [cos(angle-(angleTwist*i))*lSdRadius[i] , 
		               -sin(angle-(angleTwist*i))*lSdRadius[i]] ;
	
		
		
	}
	// console.log(treeRadiusPosVsOr[5],'treeRadiusPosVsOr 5 ');
	// console.log(lRadius[5],'lRadius 5 ');
	console.log(avgCircle[5],'avgCircle 5 ');
	
	
	//step 2a translate first 
	push();
	noFill;
	
	var translateX = gridPosX[floor(treeRow.getNum('GridX'))];
	var translateY = gridPosY[floor(treeRow.getNum('GridY'))];
	// var floorX=floor(treeRow.getNum('GridX'));
	if (floor(treeRow.getNum('GridX')) != treeRow.getNum('GridX')){
		translateX += gridPosX[floor(treeRow.getNum('GridX')) + 1];
		translateX *= 0.5;
	}
	if (floor(treeRow.getNum('GridY')) != treeRow.getNum('GridY')){
	translateY += gridPosY[floor(treeRow.getNum('GridY')) + 1];
	translateY *= 0.5;
	}
	translate(translateX,translateY);
	
	// var floorY=floor(treeRow.getNum('GridY'));
	// console.log(floorX,'floorX','  floorX + 1',floorX+1, 'gridPosX[floorX]', gridPosX[floorX]);
	
/* 	
	if (floorX == treeRow.getNum('GridX')) {
	// translate(gridPosX[floor(treeRow.getNum('GridX'))],gridPosY[floor(treeRow.getNum('GridY'))]);
		translate(gridPosX[floorX],gridPosY[floorY]);
	}
	else {
		// var floorY = floor(treeRow.getNum('GridY'));
		console.log(gridPosX[floorX],'floorX',gridPosY[floorY],'floorY <= view 1 or 2',floorX,floorY);
		// translate(gridPosX[floorX],gridPosY[floorY]);
		translate(((gridPosX[floorX] + gridPosX[floorX+1])/2),
		          ((gridPosY[floorY] + gridPosY[floorY+1])/2))
				  
				  // (gridPosX[1]+gridPosX[2])/2
		// translate((gridPosX[floorX],
		           // gridPosY[floorY]))
	} */
	
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
	strokeWeight(2);
	for(var i = 0;i<nbSpecies;i++) {
		point(avgCircle[i][0],avgCircle[i][1]);
		point(sdRadiusPosVsOr[i][0],sdRadiusPosVsOr[i][1]);
	}
	endShape(CLOSE);
	
	//step2d mark center
	point(0,0)
	
	//step2e show id
	textSize(7);
	strokeWeight(1);
	stroke(0);
	if (showID=='showID'){
		// verticalText(ID.slice(6),-2*avgRad,-2*avgRad);
		text((ID.slice(6)),-2*avgRad,-1*avgRad);
	}
	
	//step2f : draw de sd lines
	
	
	//restore and pop
	pop();
	
	console.log('bye bye Z210DrawGlyph()');
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
	console.log('mouseclicked activated');
	if (mouseY> switchBoxYrange[0] || mouseY<switchBoxYrange[1]){
		// console.log('in y range switch');
		if (mouseX >switchboxXrange[0]) {
			if (mouseX<switchboxXrange[3]){
				// console.log('prepare to switch !!')
				if (mouseX > switchboxXrange[2]){
					if (currentView!=3){
						console.log('switch to view 3');
						currentView=3;
						// remove();
						setup();
					}
					return;
				}
				if(mouseX > switchboxXrange[1])	{
					if (currentView!=2){
						console.log('switch to view 2');
						currentView=2;
						// remove();
						setup();
					}
					return;
				}
				if(mouseX > switchboxXrange[0])	{
					if (currentView!=1){
						console.log('switch to view 1');
						currentView=1;
						// remove();
						setup();
					}
					return;
				}
			}
		}
	}
		
		
	}

