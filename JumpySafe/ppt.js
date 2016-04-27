//跳转至下一页
var pageDown=function() {	

	if ($('.present .icons').length) {
		$('.present .icons').css('display', 'none');
	}

	if ($('.next').length) {
		$('.present').animate({
		height: '10%',
		width: '20%',
		left: '5%',
		right: '75%',
		top: '45%',
	    opacity: '0'},
		'300', function () {
			$('.pre').attr('class', 'past');
			$('.present').attr('class', 'pre');

			
		});
		
		$('.next').animate({
		height: '70%',
		width: '70%',
		
		right:'15%',
		left: '15%',
		top:'15%',
		opacity: '1'},
		'300', function () {
			$('.next').attr('class', 'present');
			if ($('.future:first').length) {
				$('.future:first').attr('class', 'next');
			}
			if ($('.next .icons').length) {
				$('.next .icons').css('display', 'block');
			}		
		});			

	}	
}
//跳转至上一页
var pageUp=function() {

	if ($('.present .icons').length) {
		$('.present .icons').css('display', 'none');
	}

	if ($('.pre').length) {		
		$('.present').animate({
			height: '10%',
			width: '20%',
			left: '75%',
			right: '5%',
			top: '45%',
			opacity: '0'
		},
			'300', function() {
			$('.next').attr('class', 'future');	
			$('.present').attr('class', 'next');
			if ($('.present .icons').length) {
				$('.present .icons').css('display', 'none');	
			}
				
		});

		$('.pre').animate({
			height: '70%',
			width: '70%',
			left:'15%',
			right: '15%',
			top:'15%',
			opacity: '1'},
			'300', function() {
			$('.pre').attr('class', 'present');	
			if ($('.past:last').length) {
				$('.past:last').attr('class', 'pre');
			}
			if ($('.pre .icons').length) {
				$('.pre .icons').css('display', 'block');
			}		
		});
		
	}	
}

//点击下一页按钮或按下键盘空格或右箭头
$('#next').click(_.debounce(pageDown,400));
$('html').keydown(_.debounce(function(event) {
	switch (event.which) {
		case 32:
			pageDown();
			break;
		case 37:
			pageUp();
			break;
		case 39:
			pageDown();
			break;
		default:
			// statements_def
			break;
	}
},400));

//点击上一页按钮或按下键盘左箭头
$('#pre').click(_.debounce(pageUp,400));
