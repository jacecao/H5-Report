//折线图组件
var H5ComponentPolyline = function( setClass, cfg ) {

  //创建一个基本组件
  var component = new H5ComponentBase( 'h5_component_polyline ' + setClass, cfg );

  // 绘制网格线
  var w = cfg.width;
  var h = cfg.height;
  var canvas = document.createElement('canvas');
  // 这里加2个像素是因为首尾线条会超出边界
  // 所以这里需要加入网格像素的2倍
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
  // 设置绘制文字的大小和字体
  ctx.font = '20px Arial';
  // 画网格
  var drawLine = function() {
    var step = 10;
    ctx.beginPath();
    // 这里需要在画布宽高加入2倍lineWidth像素
    ctx.lineWidth = 1;
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
    ctx.stroke();
  };

  // 画数据层
  var drawData = function() {
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.fillStyle = '#ff8878';
    ctx.strokeStyle = '#ff8878';
    // 画出数据点
    var x , y;
    // 每个网格间距
    var _w = w / (cfg.data.length + 1);
    for( var i = 0; i < cfg.data.length; i++) {
      // 让每个数据点都在中间的竖线上
      // 所以这里需要多移动一个位置
      x = _w * i + _w;
      // 为什么这里需要这样计算
      // 这里需要弄清楚是坐标移动的
      y = h * (1 - cfg.data[i].value);
      ctx.moveTo(x,y);
      ctx.arc(x, y, 5, 0, 2*Math.PI);
    }
    ctx.closePath();
    ctx.fill();
    
    // 连接每个数据点
    ctx.beginPath();
    // 移动到第一个数据点
    ctx.moveTo(_w, h * (1 - cfg.data[0].value));
    for( var j = 0; j < cfg.data.length; j++) {
      x = _w * j + _w;
      y = h * (1 - cfg.data[j].value);
      ctx.lineTo(x, y);
      // 写入数据到指定位置
      var text = cfg.data[j].value*100 + '%';
      // 获取文字的宽度
      var text_w = ctx.measureText(text).width;
      // 绘制文字
      ctx.fillText(text, x - (text_w / 2), y - 15);
    }
    ctx.stroke();
  };
  drawLine();
  drawData();

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