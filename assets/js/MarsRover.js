$(function(){	
   var MarsRover = (function () {
        function MarsRover() {
            var self = this;
            this.init();
        }
		MarsRover.prototype = {
            init: function () {
				this.rowCount = 5;
				this.columnCount = 5;
				this.roverCount = 0;
				this.roverList = [];
				this.directionList = ['N','E','S','W'];
				this.log = $('.log');
				this.messages = {
					welcome : 'Welcome to Mars :)<br/>',
					plateauCreate : 'Plateau Created. Size:{rowCount} x {columnCount}<br/>',
					cantMove : '.Rover Cant Move. Position Outside The Plateau<br/>',
					wrongCommand : 'Wrong Command !<br/>CommanList:<br/>R: Turn Right<br/>L: Turn Left<br/>M: Forward Move<br/>',
					noRover : '.Rover Not Created !<br/>'
				}
				this.log.append(this.messages.welcome);
            },
			createPlateau : function(x,y){
				this.rowCount = typeof x == 'undefined' ? this.rowCount : x;
				this.columnCount = typeof y == 'undefined' ? this.columnCount : y;
				if ($('.Plateau table').length > 0) {
					$('.Plateau').html('');
				}
				var table = $('<table></table>').attr('cellspacing','0').attr('cellpadding','0');
				for(i=0; i <= this.rowCount; i++){
				var row = $('<tr></tr>');
					for(ii=0; ii <= this.columnCount; ii++){
						row.append('<td></td>');
					}
					table.append(row);
				}
				$('.Plateau').append(table); 
				this.log.append(this.messages.plateauCreate.replace('{rowCount}',this.rowCount).replace('{columnCount}',this.columnCount));
			},
			createRover : function(x,y,d){
				x = parseInt(x);
				y = parseInt(y);
				var r = this.roverCount;
				if(typeof this.roverList[r] == 'undefined'){
					this.roverList[r] = {'x':x,'y':y,'d':d};
					this.log.append(r+'.Rover Created. Position[x: '+x+', y: '+y+', d: '+d+']<br/>');
					var position = {
						x : (x * 20) + x + 1,
						y : (y * 20) + y + 1,
						d : this.directionList.indexOf(d) * 90
					}
					$('.Plateau').append('<div class="rover rover-' + r + '" style="left:'+ position.x +'px; bottom:'+position.y+'px;transform: rotate('+position.d+'deg);">' + r + '</div>');
					if(this.roverList.length > 0){
						$('select[name=roverId]').html('');
						$.each(this.roverList,function(i,e){
							var item = $('<option></option>').val(i).html(i+'. Rover');
							$('select[name=roverId]').append(item);
						});
						$('select[name=roverId]').val(this.roverCount);
						$('.form-group.list').slideDown();
					}
					this.roverCount++;
				}
			},			
			rotate : function(rover,angle) {
				$({deg: this.directionList.indexOf(this.roverList[rover].d) * 90}).animate({deg: angle}, {
					duration: 1000,
					step: function(now) {
						$('.rover-'+rover).css({
							transform: 'rotate(' + now + 'deg)'
						});
					}
				});
			},
			moveRover : function(r,cList){
				var rover = this.roverList[r];
				if(typeof rover == 'undefined'){
					this.log.append(r+this.messages.noRover);
					return false;
				}
				var i = 0;
				var that = this;
				if(cList.length > 0){
					var intervalId = setInterval(function(){
						var command = cList.substring(i,i+1);
						switch(command) {
							case 'M':
								switch(rover.d) {
									case 'N':
										if(rover.y >= that.rowCount){
											that.log.append(r+that.messages.cantMove);
										}else{
											rover.y++;
											var animateModel = {
												bottom : (rover.y * 20) + rover.y + 1
											};
										}
									break;
									case 'E':
										if(rover.x >= that.columnCount){
											that.log.append(r+that.messages.cantMove);
										}else{
											rover.x++;
											var animateModel = {
												left : (rover.x * 20) + rover.x + 1
											};
										}
									break;
									case 'S':
										if(rover.y == 0){
											that.log.append(r+that.messages.cantMove);
										}else{
											rover.y--;
											var animateModel = {
												bottom : (rover.y * 20) + rover.y + 1
											};
										}
									break;
									case 'W':
										if(rover.x == 0){
											that.log.append(r+that.messages.cantMove);
										}else{
											rover.x--;
											var animateModel = {
												left : (rover.x * 20) + rover.x + 1
											};
										}
									break;
								}
							break;
							case 'R':
								var dIndex = Math.abs(that.directionList.indexOf(rover.d) + 1) % 4;
								rover.d = that.directionList[dIndex];
							break;
							case 'L': 
								var dIndex = Math.abs((that.directionList.indexOf(rover.d) + 3) % 4);
								rover.d = that.directionList[dIndex];
							break;
							default:
								that.log.append(that.messages.wrongCommand);
							break;
						}
						if(command == 'R' || command == 'L'){
							$.MarsRover.rotate(r,90*dIndex);
						}else if (command == 'M'){
							$('.rover-'+r).animate(animateModel,500);
						}
						
						if(i+1 == cList.length){
							that.roverList[r] = rover;
							that.log.append(r+'.Rover Reached Position. Position[x: '+rover.x+', y: '+rover.y+', d: '+rover.d+']<br/>')
						}
						i++;
						if(i == cList.length){
							clearInterval(intervalId);
							intervalId = null;
						}
					},500);
				}
			}
		}
		return MarsRover;
    })();
	$.extend({
        MarsRover: new MarsRover()
    });
		
	$.MarsRover.createPlateau();
	
	$('.setSize').click(function(){
		var coordinat = $('input[name=coordinat]').val().split(' ');
		$.MarsRover.createPlateau(coordinat[0],coordinat[1])
	});
	$('.addRover').click(function(){
		var roverCoordinat = $('input[name=roverCoordinat]').val().split(' ');
		$.MarsRover.createRover(roverCoordinat[0],roverCoordinat[1],$('select[name=direction] option:checked').val());
	});
	$('.sendCommand').click(function(){
		$.MarsRover.moveRover($('select[name=roverId] option:checked').val(),$('input[name=command]').val());
	});
});