//折线图组件
var H5ComponentPolyline = function( setClass, cfg ) {

  //创建一个基本组件
  var component = new H5ComponentBase( 'h5_component_polyline ' + setClass, cfg );

  // 绘制网格线
  var w = cfg.width;
  var h = cfg.height;
  var canvas = document.createElement('canvas');
  canvas.width = w + 2;
  canvas.height = h + 2;
  // 设置canvasc样式
  $(canvas).css({
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%'
  });
  var ctx = canvas.getContext('2d');
  // 画网格
  var drawLine = function() {
    var step = 10;
    ctx.beginPath();
    ctx.lineWidth = 1;
    // 再画布前后两处加入2倍lineWidth像素
    ctx.strokeStyle = '#aaa';
    // 画水平线
    for( var i = 0; i < step + 1; i++) {
      var y = (h/step) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    // 画竖条线
    step = cfg.data.length + 1;
    for( var j = 0; j < step + 1; j++) {
      var x = (w/step) * j;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }

    ctx.closePath();
    ctx.stroke();
  };
  drawLine();

  component.append(canvas);
  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data ) {

    
    //触发元素加载动画
    component.on('onLoad',function(){
    
    })
    .on('onLeave',function(){
    
    });

  }else{
    console.error('请加入数据，data:[{},....]');
  }

  return component;
};