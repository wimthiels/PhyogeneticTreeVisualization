var canvasX=640;
var canvasY=640;
var scaling = 0.8;

var mat_dist;
function preload() {
mat_dist = loadTable("compare_dist_STATE_0STATE_23000.csv", "header");
}

function setup() {
  createCanvas(canvasX, canvasY);
  textFont("Arial");
  textAlign(CENTER);
  textSize(32*scaling)
  
}

function draw() {
	//PART 1 of comparing 2 trees : the structural differences via containment
	DrawStructuralDiffTrees()
	
	//PART 2 of comparing 2 trees : the differences in evolutionary distances
	DrawEvolDiffTrees()
	
}

function DrawEvolDiffTrees() {
//	step1_init_parm()
//  function step1_init_parm(){
		//d = delta or difference 
		//l = length
		//sp = species
		//nb = number
		//ax = axis
		//col = color
		//h = height
		var xo = 100; //ORIGIN FIXED VALUE => TRANSLATION around origin
		var yo = 600; //ORIGIN FIXED VALUE
		var lyax = 200; //y-axis FIXED VALUE !!
		var lxax = lyax*2;
		var lMaxBar = 0.13142278790486;  // look up in file or guess
		var nbbars = 15;
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
		var spBarsp = ['S','O','G','H','C','B'];
		
		
		

		var xaxRatioBelow = 0.1; // fraction of x-axis below origin
		var yaxRatioBelow = 0.1;
		
		var lxaxNeg = lxax*xaxRatioBelow // length x axis below zero
		var lxaxPos = lxax - lxaxNeg;
		var lyaxNeg = lyax*yaxRatioBelow;
		var lyaxPos = lyax - lyaxNeg;
	
		
		var dBar = lxaxPos / (nbbars+1) // distance between bars
		
		
		var colsp2 = '0' //black default color bar second species
		var colDelta = '255,0,0'  //red default color for indication delta between sp1 and sp2
		
		var lxSepSp = dBar/2;  //linelength barseparator
		

		
	step2_draw_initial_setup()
	
	// step3_draw_distance_lines()
	
	// step4_draw_info_text()
	
	// step5_interactive_info()
	

		
		
	
	
	function step2_draw_initial_setup(){
		//draw axis
		push();
		translate(xo,yo)                         // TRANSLATION !!
		line(0,lyaxNeg,0,-lyaxPos);
		line(-lxaxNeg,0,lxaxPos,0);
		
		// draw species bar species
		for (var i = 0;i<nbsp;i++){
			textSize(16*scaling);fill(0);text(spBarsp[i],0,spBarY[i]);
		}
		
		
		
		pop();                                   //POP translation
		
		
		
		
		
		
	}
	
}
function DrawStructuralDiffTrees(){
	var rect1x = 20*scaling;
	var rect1y = 40*scaling;
	var rect1h = 100*scaling;
	var rect1w = 200*scaling;
	
	// Tree_0
	x1=DrawContainment(rect1x,rect1y,rect1w,rect1h,'1');
	textSize(32*scaling);fill(0);text("Tree 0",rect1x+4*rect1w/8,rect1y - 10);
	

	// Tree_23000
	deltaBetweenTrees = 60*scaling;
	var rect2x = rect1x;
	var rect2y = rect1y + rect1h + deltaBetweenTrees;
	var rect2w = rect1w;
	var rect2h = rect1h;
	x2=DrawContainment(rect2x,rect2y,rect2w,rect2h,'3');
	
	//textSize(32*scaling);fill(0);text("Tree 23000",rect2x+4*rect1w/8,rect2y - 10);
	textSize(32*scaling);fill(0);text("Tree 23000",rect2x+4*rect1w/8,rect2y + rect2h + 30);
	
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
	DrawContainment(containx,containy,containw,containh,'4');
	
	//legend
	var legendx = rect2x + rect1w + 260;
	var legendy = midheigthBetweenTrees - deltaBetweenTrees;
	DrawLegendSpecies(legendx,legendy);
	textSize(32*scaling)	
	
	function DrawContainment(x,y,w,h, typeNr) {
	textSize(32*scaling)
	textShift = 12*scaling;
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
	function DrawLegendSpecies(x, y){
		textAlign(LEFT);
		var textsize = 20;
		fill(0);textSize(textsize*scaling);
		yshift = textsize *scaling; ctr=0;
		text("S : Siamang",x ,y+ ctr*yshift);ctr++;
		text("O : Orangutan",x,y+ ctr*yshift);ctr++;
		text("G : Gorilla",x,y+ ctr*yshift);ctr++;
		text("H : Human",x,y+ ctr*yshift);ctr++;
		text("C : Chimp",x,y+ ctr*yshift);ctr++;
		text("B : Bonobo",x,y+ ctr*yshift);ctr++;
		textAlign(CENTER);
	}
	
}

