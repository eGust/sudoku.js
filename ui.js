var selectedCell = null;

function CreateTableObj() {
	var tab = $('<div>'), pan = $('<div>').addClass('row').addClass('pan');
	pan.append($('<span>').addClass('cellInner').addClass('reset').text('R'));
	for (var i = 0; i < 9; i++)
	{
		var r = $('<div>').addClass('row'), rid = 'r'+i, rcls = 'row'+i;
		for (var j = 0; j < 9; j++)
			r.append($('<span>').addClass('cellOutter')
			    .addClass(rcls).addClass('col'+j).addClass('idx'+(i*9+j))
			    .addClass('mtx'+Math.floor(Math.floor(i/3)*3+j/3)));
		tab.append(r);

		var d = i+1;
		pan.append($('<span>').addClass('cellInner').addClass('digit').addClass('N'+d).text(d));
	}

	$('.row0,.row3,.row6', tab).addClass('boldUpBoder');
	$('.row8', tab).addClass('boldDownBoder');

	$('.col0,col3,col6', tab).addClass('boldLeftBoder');
	$('.col8', tab).addClass('boldRightBoder');

	$('.mtx1,.mtx3,.mtx5,.mtx7', tab).addClass('BGColor1');
	$('.mtx0,.mtx2,.mtx4,.mtx6,.mtx8', tab).addClass('BGColor2');

	$('.cellOutter', tab).append($('<span>').addClass('cellInner').text(' '));

	var allCells = $('.cellInner', tab), thisObject = { table: tab, panel: pan, cells: allCells, solution: null, };

	function updateDone()
	{
		for(var i=1; i<=9; i++)
		{
			if($('.cellInner:contains('+i+')', tab).length==9)
				$('.cellInner.N'+i, pan).addClass('done');
		}
	}

	function resetClasses()
	{
		selectedCell = null;
		allCells.removeClass('sameDigit').removeClass('highlight').removeClass('selected').removeClass('warning');
		$('.digit', pan).removeClass('disabled').removeClass('done').removeClass('selected').show();
		$('.reset', pan).hide();
		updateDone();
	}

	allCells.click(function () {
		var cell = $(this), d = cell.text().trim(), sel = cell.hasClass('selected');
		
		resetClasses();
		if(sel)
		{
			return;
		}
		
		var cs = cell.parent().attr('class'), col = cs.match(/col\d/)[0], row = cs.match(/row\d/)[0], mtx = cs.match(/mtx\d/)[0];

		cell.addClass('selected');
		selectedCell = cell;

		if(d)
		{
			var dset = {};
			dset[col] = 0;
			dset[row] = 0;
			dset[mtx] = 0;

			$('.cellInner:not(.selected):contains('+d+')', tab).addClass('sameDigit').each( function(i, c) {
				var t = $(c).parent().attr('class'), col = t.match(/col\d/)[0], row = t.match(/row\d/)[0], mtx = t.match(/mtx\d/)[0];
				dset[col] = 0;
				dset[row] = 0;
				dset[mtx] = 0;
			});

			var cls =  Object.keys(dset).map(function (k) { return '.'+k; });
			$('.cellInner:not(.filled)', $('.cellOutter:not(' + cls.join(',') + ')', tab)).addClass('warning');

			if(!cell.hasClass('fixed'))
			{
				$('.digit', pan).hide();
				$('.reset', pan).show();
				//pan.show();
			}
		}
		else
		{
			var relative = $('.cellInner.filled', $('.'+col+','+'.'+row+','+'.'+mtx, tab)).addClass('highlight'), rd = {};
			$('.digit', pan).removeClass('disabled').show();
			relative.each(function (i, c) {
				var txt = $(c).text().trim();
				if(txt)
					rd[txt] = true;
			});

			for(var n in rd)
			{
				$('.N'+n, pan).addClass('disabled');
			}
			$('.reset', pan).hide();
			//pan.show();
		}
	});

	$('.digit', pan).click(function () {
		if($(this).hasClass('disabled') || $(this).hasClass('done'))
			return;

		var d = $(this).text();
		if(selectedCell && (selectedCell.text().trim()==''))
		{
			var idx = parseInt(selectedCell.parent().attr('class').match(/idx(\d+)/)[1]), s = thisObject.solution;
			if(s)
			{
				if(s[idx]!=d)
				{
					tip("Wrong number: "+d, { 'color': 'red', 'font-size': '20pt', 'font-weight': 'bold' });
					return;
				}
			}

			var sc = selectedCell;
			sc.text(d).addClass('filled').click();
			if (!$('.cellInner.N'+d, pan).hasClass('done'))
				sc.click();

			if($('.cellInner:not(.filled)', tab).length==0)
			{
				tip("All filled! You won!", { 'color': 'blue', 'font-size': '24pt', 'font-weight': 'bold' });
			}
		}
		else
		{
			var sel = $(this).hasClass('selected');
			resetClasses();
			if(sel)
				return;

			$(this).addClass('selected');
			var dset = {};
			$('.cellInner:contains('+d+')', tab).addClass('sameDigit').each( function(i, c) {
				var t = $(c).parent().attr('class'), col = t.match(/col\d/)[0], row = t.match(/row\d/)[0], mtx = t.match(/mtx\d/)[0];
				dset[col] = 0;
				dset[row] = 0;
				dset[mtx] = 0;
			});

			var cls =  Object.keys(dset).map(function (k) { return '.'+k; });
			$('.cellInner:not(.filled)', $('.cellOutter:not(' + cls.join(',') + ')', tab)).addClass('warning');
		}
	});

	$('.reset', pan).click(function () {
		if((!selectedCell) || $(this).hasClass('disabled'))
			return;
		selectedCell.text(' ').removeClass('filled').click();
	});

	return thisObject;
}

function tip(text, style)
{
	if(style && typeof(style)=="object")
		$('#tip').css(style);
	$('#tip').text(text).show(500).delay(1000).fadeOut(500);
}

$(function () {
	var tobj = CreateTableObj();
	$('.main').append(tobj.table).append($('<p>')).append(tobj.panel);
	$('.panel').append($('<p>'))
		.append($('<span>').attr('id', 'btnToJSON').addClass('Button').text('Get JSON'))
		.append($('<span>').attr('id', 'btnClear').addClass('Button').text('Clear'))
		.append($('<span>').attr('id', 'btnStart').addClass('Button').text('Start'))
		.append($('<span>').attr('id', 'btnRestart').addClass('Button').text('Restart'))
		.append($('<span>').attr('id', 'btnRandom').addClass('Button').text('Generate'))
		.append($('<span>').attr('id', 'btnSolve').addClass('Button').text('Solve'))
		.append($('<span>').attr('id', 'btnFromJSON').addClass('Button').text('From JSON'))
		.append($('<p>')).append($('<textarea>').attr('id', 'json'))
		.append($('<div>').attr('id', 'tip').hide());

	$('#btnToJSON').click(function () {
		var arr = $('.cellInner', tobj.table).contents().map(function(i, c) {
			var t = $(c).text().trim();
			return t ? parseInt(t) : 0;
		});
		$('#json').val(JSON.stringify(arr.toArray()));
	});

	$('#btnClear').click(function () {
		tobj.cells.text(' ').removeClass('filled').removeClass('fixed').removeClass('sameDigit')
			.removeClass('highlight').removeClass('selected').removeClass('warning').removeClass('selected');
		//tobj.panel.hide();
		$('.digit', tobj.panel).removeClass('disabled').removeClass('done').removeClass('selected').show();
		selectedCell = null;
		tobj.solution = null;
		$('#btnStart').text('Start');
	});
	
	$('#btnStart').click(function () {
		var btn = $(this);
		if(btn.text()=='Start')
		{
			$('.cellInner.filled', tobj.table).addClass('fixed');
			btn.text('Reset');
		}
		else
		{
			$('.cellInner.filled', tobj.table).removeClass('fixed');
			btn.text('Start');
		}
	});
	
	$('#btnRestart').click(function () {
		$('.digit', tobj.panel).removeClass('disabled').removeClass('done').removeClass('selected').show();
		tobj.cells.removeClass('sameDigit').removeClass('highlight')
			.removeClass('selected').removeClass('warning').removeClass('selected');
		$('.cellInner.filled:not(.fixed)', tobj.table).text(' ').removeClass('filled');
		selectedCell = null;
		//tobj.panel.hide();
	});

	$('#btnSolve').click( function () {
		if ($('#btnStart').text() != 'Reset')
			return;
		var txt = $('.cellOutter>.cellInner').text(), numbers = [], z = 0;
		numbers.length = 81;
		for (var i = 0; i < txt.length; i++)
		{
			if (txt[i] == ' ') {
				numbers[i] = 0;
				z++;
			} else {
				numbers[i] = parseInt(txt[i]);
			}
		}

		if (z > 81-16)
			return;
		
		var s=new Sudoku();
		s = s.solve(numbers);
		
		for (var i = 0; i < 81; i++)
			$('.cellOutter.idx'+i+' > .cellInner').text(s[i]).addClass('filled');
	});

	function initGame(table)
	{
		var cs = tobj.cells, solution = (new Sudoku()).solve(table);
		$('#btnClear').click();
		tobj.solution = solution;
		for(var i=0; i<81; i++)
		{
			var n = table[i];
			if(n)
			{
				$(cs[i]).text(n).addClass('filled');
			}
		}
		$('#btnStart').click();
	}
	
	$('#btnFromJSON').click(function () {
		var jv = JSON.parse($('#json').val());
		if(jv.length==81)
		{
			initGame(jv);
		}
	});

	$('#btnRandom').click(function () {
		var table = [];
		do {
			table = Sudoku.crossNumber(Sudoku.generate(), 50, 10);
		} while(!table)
		initGame(table);
	});
	
});
