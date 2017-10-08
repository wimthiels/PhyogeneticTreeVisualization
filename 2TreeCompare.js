var canvasX=640;
var canvasY=640;
var scaling = 0.5;
var scalingStruc = 0.4;  //extra scaling used for structural diff trees if needed

var dist_mat;
var sortKey = 3;  //3 = sort on delta // 1 : sort on species 1length // 2 : sort on species2 length
var currentSort = sortKey;
var groupBySpIC = 0;
if(groupBySpIC==1) {var nbbars = 30;}
else {var nbbars = 15;}
var arrayData = [];
// containment graph	
var rect1x = 850*scalingStruc;
var rect1y = 190*scalingStruc;  // position of first of the three rectangles
var rect1h = 100*scalingStruc;
var rect1w = 200*scalingStruc;



// variables for the distance graph
//d = delta or difference 
//l = length
//sp = species
//nb = number
//ax = axis
//col = color
//h = height
var xo = 20; //ORIGIN FIXED VALUE => TRANSLATION around origin ALL other stuff in relation to this
var yo = 200; //ORIGIN FIXED VALUE
var lyax = 120; //y-axis FIXED VALUE !!
var lxax = 2*lyax;

var lMaxBar = 0.13142278790486;  // look up in file or guess

var nbsp = 6;

var l2p = lyax/lMaxBar // length to pixels !! = scaling of distances to pixels on screen

//species bar
var dspbarYax = lyax*0.1 // distance between species bar and y axis
var lspbar = lyax / 3 // length species bar
var dspbar = lspbar/5 // delta speciesnames on speciesbar
var spBarY = [];    //y posities van de species in de speciesbar in een array
spBarY[0] =  - lyax - dspbarYax - lspbar  //denk eraan yrichting blijft naar beneden gericht !!
for (var i = 1; i < nbsp; i++) {
	spBarY[i] = spBarY[i-1] + dspbar;
	}
var spPointRad = dspbar/4; //radius of point on speciesline
var spBarsp = ['S','O','G','H','C','B'];
var dict_spIdx = {'siamang': 0,'orangutan': 1,'gorilla': 2,'human': 3,'chimp': 4,'bonobo': 5};
var ypointshift = 0.3*dspbar; //to align points nicely with letter


var xaxRatioBelow = 0; // fraction of x-axis below origin
var yaxRatioBelow = 0.1;

var lxaxNeg = lxax*xaxRatioBelow // length x axis below zero
var lxaxPos = lxax - lxaxNeg;
var lyaxNeg = lyax*yaxRatioBelow;
var lyaxPos = lyax - lyaxNeg;


var dBar = lxaxPos / (1.5* nbbars+1) // distance between bars


var colsp2 = '0' //black default color bar second species
var colDelta = '255,0,0'  //red default color for indication delta between sp1 and sp2

var lxSepSp = dBar/2;  //linelength barseparator
	
idxCpb={"code":0,"sp1":1,"sp2":2,"distsp1":3,"distsp2":4,"delta":5,"redundIC":6}
idxCpb_rev={0:"code",1:"sp1",2:"sp2",3:"distsp1",4:"distsp2",5:"delta",6:"redundIC"} 

// sortBox
var sortBoxheight = dspbar*2; 
var sortBoxwidth = 2*dBar; // same height a speciesnames in speciesbar
var sortBoxStartx = dBar; //remember : relative to origin
var sortBoxStarty = spBarY[0] - 3* sortBoxheight  + 266;
var sortBoxXrange=[];  
for (var i = 0;i<6;i++){
	sortBoxXrange.push(sortBoxStartx+ i*sortBoxwidth)}
var sortBoxYrange=[sortBoxStarty,sortBoxStarty+sortBoxheight];  

var sortBoxOffset = xo

var dContLegX =  10; //distance between legend and containment
var legendX = rect1x + rect1w + dContLegX;
var legendY = rect1y;

var prevSpecies = ["X","X"];
var currentSpecies = ["X","X"];


function preload() {
dist_mat = loadTable("compare_dist_STATE_0STATE_23000.csv", "header");
}

function setup() {
createCanvas(canvasX, canvasY);
textFont("Helvetica");
textAlign(CENTER);
textSize(32*scaling)

 //PART 1 of comparing 2 trees : the structural differences via containment
Z100DrawStructuralDiffTrees()
  
 //PART 2 of comparing 2 trees : the differences in evolutionary distances
Z200DrawEvolDiffTrees()
  
  
}


function draw() {

	//if sortkey changed : do Z200DrawEvolDiffTrees()  again

	
}


function Z100DrawStructuralDiffTrees(){

	
	// Tree_0
	x1=Z112DrawContainment(rect1x,rect1y,rect1w,rect1h,'1');
	textSize(32*scalingStruc);fill(0);text("State_0",rect1x+4*rect1w/8,rect1y - 10);
	

	// Tree_23000
	deltaBetweenTrees = 60*scalingStruc;
	var rect2x = rect1x;
	var rect2y = rect1y + rect1h + deltaBetweenTrees;
	var rect2w = rect1w;
	var rect2h = rect1h;
	x2=Z112DrawContainment(rect2x,rect2y,rect2w,rect2h,'3');
	
	//textSize(32*scalingStruc);fill(0);text("Tree 23000",rect2x+4*rect1w/8,rect2y - 10);
	textSize(32*scalingStruc);fill(0);text("State_23000",rect2x+4*rect1w/8,rect2y + rect2h + 30);
	
	//connector lines
	midheigthBetweenTrees = rect2y-deltaBetweenTrees/2
	fill(0);
	line(x1[0],x1[1],rect1x+rect1w+20,midheigthBetweenTrees);
	line(x2[0],x2[1],rect2x+rect2w+20,midheigthBetweenTrees);
	
	
	// similar containment between trees
	deltaX=20;
	var containx = rect1x + rect1w + deltaX;
	var containy = midheigthBetweenTrees;
	var containw = rect1w*2;
	var containh = rect1h*2;
	Z112DrawContainment(containx,containy,containw,containh,'4');
	
	//legend
	// var legendx = rect2x + rect1w + 260;
	// var legendy = midheigthBetweenTrees - deltaBetweenTrees;
	Z118DrawLegendSpecies(containx + containw/1.9,containy-containh/4); // ad hoc gepositioneerd
	textSize(32*scalingStruc)	
}



function Z112DrawContainment(x,y,w,h, typeNr) {
	textSize(32*scalingStruc)
	textShift = 12*scalingStruc;
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
				textSize(16*scalingStruc)
				text("B",ell7x,ell7y+textShift/2)
				text("C",ell8x,ell8y+textShift/2)
				textSize(32*scalingStruc)
				
				
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


function Z118DrawLegendSpecies(x, y){
textAlign(LEFT);
var textsize = 20;
fill(0);textSize(textsize*scalingStruc);
yshift = textsize *scalingStruc; ctr=0;
text("S : Siamang",x ,y+ ctr*yshift);ctr++;
text("O : Orangutan",x,y+ ctr*yshift);ctr++;
text("G : Gorilla",x,y+ ctr*yshift);ctr++;
text("H : Human",x,y+ ctr*yshift);ctr++;
text("C : Chimp",x,y+ ctr*yshift);ctr++;
text("B : Bonobo",x,y+ ctr*yshift);ctr++;
textAlign(CENTER);
}

function Z200DrawEvolDiffTrees() {

	Z205sort_input_data();

	push();
	translate(xo,yo)                         // TRANSLATION !!	
	Z210draw_initial_setup();
	
	Z220draw_distance_lines();
	
	pop();                                   //POP translation
	
	// step4_draw_info_text()
	
	// step5_interactive_info()
	
}

function Z205sort_input_data(sortKey)	{
	arrayData = dist_mat.getArray();   // get the table into 2D array

	arrayData.sort(function(a, b) {
		// First key : sort on groupBySpIC
		if (groupBySpIC==1){
		if (a[idxCpb.sp1]<b[idxCpb.sp1]) return -1;
		if (a[idxCpb.sp1]>b[idxCpb.sp1]) return 1;
		}
		
		var sortIdx;
		switch(currentSort){
		  case 1:   //sort on species1
			sortIdx = idxCpb.distsp1
			break;
		  case 2:  //sort on species2 
			sortIdx = idxCpb.distsp2
			break;
		  case 3:  //sort on delta (default)
			sortIdx = idxCpb.delta
			break;
	  }
	
	if (currentSort==3||2||1){
	if (Number(a[sortIdx])<Number(b[sortIdx])) return -1;
	if (Number(a[sortIdx])>Number(b[sortIdx])) return 1;
	}
	else{
	if (a[sortIdx]<b[sortIdx]) return -1;
	if (a[sortIdx]>b[sortIdx]) return 1;
	}
	
	//the delta is always the fallback in case of ties
	if (Number(a[idxCpb.delta])<Number(b[idxCpb.delta])) return -1;
	if (Number(a[idxCpb.delta])>Number(b[idxCpb.delta])) return 1;
	  
	return 0;
	 })

}

	
function Z210draw_initial_setup(){
	//recalculate x axis and number of bars
	if(groupBySpIC==1) {nbbars = 30;}
	else {nbbars = 15;}
	lxax = (nbbars*dBar) * (1+xaxRatioBelow);
	lxaxNeg = lxax*xaxRatioBelow // length x axis below zero
	lxaxPos = lxax - lxaxNeg;
	prevSpecies=['X','X'];
	
	//draw axis
	// line(0,lyaxNeg,0,-lyaxPos); //y-axis  
	strokeWeight(1);
	fill(200);
	line(-lxaxNeg,0,lxaxPos,0);
	
	//draw sortBox
	Z212draw_sort_box();
	
	// draw species bar species
	reset()
	for (var i = 0;i<nbsp;i++){
		textSize(16*scaling);fill(0);text(spBarsp[i],0,spBarY[i]);
	}	
	
	// eye guiders species
	stroke(2,2,2,2);
	stroke(205)
	for (var i = 0;i<nbsp;i++){
		line(0+dBar/5,spBarY[i]-ypointshift,dBar*nbbars,spBarY[i]-ypointshift);
	}	
	stroke(0)
}

function Z212draw_sort_box(){
	textAlign(CENTER);
	var textsize = 20;
	textSize(textsize*scalingStruc);
	reset(); 
	print(currentSort,"currentsort");print(sortKey,"sortKey");
	for (var i=0;i<sortBoxXrange.length-1;i++){
			
		switch(i){
			case 0:
				fill(1);text("Sp",sortBoxXrange[i],sortBoxStarty,sortBoxwidth,sortBoxheight);noFill();
				if (groupBySpIC==1) fill(255,0,0,100);
				break;
			case 1:
				continue;
				break;
			case 2:
				fill(1);text("T1",sortBoxXrange[i],sortBoxStarty,sortBoxwidth,sortBoxheight);noFill();
				if (currentSort==1) fill(255,0,0,100);
				break;
			case 3:
				fill(1);text("T2",sortBoxXrange[i],sortBoxStarty,sortBoxwidth,sortBoxheight);noFill();
				if (currentSort==2) fill(255,0,0,100);
				break;
			case 4:
				fill(1);text("df",sortBoxXrange[i],sortBoxStarty,sortBoxwidth,sortBoxheight);noFill();
				if (currentSort==3) fill(255,0,0,100);
				break;				
		}

		rect(sortBoxXrange[i],sortBoxStarty,sortBoxwidth,sortBoxheight);

	}
}
	
function Z220draw_distance_lines(){
		yprev = 0;
		barNb = 0;
		for (var row = 0; row < arrayData.length; row++) {
		
			if ((arrayData[row][idxCpb.redundIC]==0 || groupBySpIC==1)
				&& arrayData[row][idxCpb.code].charAt(1)!="*"){
					
				currentSpecies[0]= arrayData[row][idxCpb.sp1];
				currentSpecies[1]= arrayData[row][idxCpb.sp2];
				console.log(currentSpecies,"currentspecies",prevSpecies,"prevsp")
				
				Z222draw_species_line(row,barNb)
				yprev=Z224draw_bar_line(row,barNb,yprev)
				
				barNb++;
				prevSpecies[0] = currentSpecies[0];
				prevSpecies[1] = currentSpecies[1];
				// console.log(prevSpecies,"prevspecies")
				
				}
		}
}

function Z222draw_species_line(rowNr,barNb){	
	x = (barNb+1)*dBar;
	// sp1Idx = dict_spIdx[dist_mat.getString(rowNr, "sp1")];
	// sp2Idx = dict_spIdx[dist_mat.getString(rowNr, "sp2")];
	sp1Idx = dict_spIdx[arrayData[rowNr][idxCpb.sp1]];
	sp2Idx = dict_spIdx[arrayData[rowNr][idxCpb.sp2]];

	y1= spBarY[sp1Idx]-ypointshift;
	y2= spBarY[sp2Idx]-ypointshift; 
	ellipse(x,y1,spPointRad,spPointRad);
	ellipse(x,y2,spPointRad,spPointRad);
	
	line(x,y1,x,y2);

	
	if ((currentSpecies[0]==prevSpecies[0])||(currentSpecies[0]==prevSpecies[1])){
		line(x,y1,x-dBar,y1)}
	if ((currentSpecies[1]==prevSpecies[0])||(currentSpecies[1]==prevSpecies[1])){
		line(x,y2,x-dBar,y2)}

			
}



function Z224draw_bar_line(rowNr,barNb,yprev) {
			x = (barNb+1)*dBar;
			// console.log(dist_mat.getNum(barNb,"delta"))
			// dsp1 = dist_mat.getNum(rowNr,"distSTATE_0")*l2p;
			// dsp2 = dist_mat.getNum(rowNr,"distSTATE_23000")*l2p;
			// dsp1sp2 = dist_mat.getNum(rowNr,"delta")*l2p;
			dsp1    = arrayData[rowNr][idxCpb.distsp1]*l2p;
			dsp2    = arrayData[rowNr][idxCpb.distsp2]*l2p;
			dsp1sp2 = arrayData[rowNr][idxCpb.delta]*l2p;


			
			
			stroke(0);line(x,-dsp1sp2,x,-(dsp2+dsp1sp2));
			strokeWeight(2);
			// if (dsp1sp2>0) {
				// stroke(255, 0, 0);line(x,0,x,-dsp1sp2);stroke(0);
			// }
			// red delta line
			if (barNb>0){
				console.log(currentSpecies[0],prevSpecies[0],"curr", "prev");
				if(currentSpecies[0]==prevSpecies[0] || groupBySpIC!=1){
				stroke(255, 0, 0);line(x-dBar,yprev,x,-dsp1sp2);stroke(0);
			}}
			strokeWeight(1);
			
			return (-dsp1sp2)
			
}

function reset(){
	// background(59); DO NOT USE THIS !! paints over the entire screen !!!
	noFill();
	stroke(0);
	strokeWeight(1);
}


function mouseClicked() {
	// console.log('mouseclicked activated');
	if ((mouseY> sortBoxYrange[0]+yo) && (mouseY<sortBoxYrange[1]+yo)){
		console.log('in y range switch',mouseX,groupBySpIC,nbbars,dBar);
		if (mouseX >sortBoxXrange[0]+sortBoxOffset) {
			if (mouseX<sortBoxXrange[5] +sortBoxOffset){
				// console.log('prepare to switch !!')
				if (mouseX > sortBoxXrange[4]+sortBoxOffset){
					if (currentSort!=3){
						currentSort=3;
						setup();
					}
					return;
				}	
				if (mouseX > sortBoxXrange[3]+sortBoxOffset){
					if (currentSort!=2){
						currentSort=2;
						setup();
					}
					return;
				}
				if (mouseX > sortBoxXrange[2]+sortBoxOffset){
					if (currentSort!=1){
						currentSort=1;
						setup();
					}
					return;	
				}
				if (mouseX > sortBoxXrange[1]+sortBoxOffset){
					return;	
				}
				if (mouseX > sortBoxXrange[0]+sortBoxOffset){
					if (groupBySpIC==0){groupBySpIC=1}
					else{groupBySpIC=0}
					setup();
					return;					
				}
			}
		}
	}
}