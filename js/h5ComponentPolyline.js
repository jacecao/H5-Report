//折线图组件
var H5ComponentPolyline = function( setClass, cfg ) {

  //创建一个基本组件
  var component = new H5ComponentBase( 'h5_component_polyline ' + setClass, cfg );

  // 设置canvas属性
  var w = cfg.width;
  var h = cfg.height;
  // 创建canvasDOM
  var creatCanvas = function() {
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

    component.append(canvas);
    return ctx;
  };

  // 绘制网格线
  var drawLine = function() {
    var ctx = creatCanvas();
    ctx.clearRect(0, 0, w + 2, h + 2);
    var step = 10;
    ctx.beginPath();
    // 这里需要在画布宽高加入2倍lineWidth像素
    ctx.lineWidth = 1;
    ctx.strokeStyle = cfg.canvasStyle && cfg.canvasStyle.borderColor ? cfg.canvasStyle.borderColor : '#aaa';
    // 画水平线
    for( var i = 0; i < step + 1; i++) {
      var y = (h/step) * i;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    // 画竖条线 同时创建数据描述文本
    step = cfg.data.length + 1;
    
    // 文本宽度
    // 注意这里的text_w实际比canvas像素要大
    // 所以这里要将该宽度缩小1倍
    var text_w = Math.floor(w / step) / 2;
    for( var j = 0; j < step + 1; j++) {
      var x = (w/step) * j;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      // 创建文本DOM到组件
      if(cfg.data[j]) {
        var textDom = $('<span class="polyline_text"></span>');
        textDom.text( cfg.data[j].text );
        textDom.css({
          position: 'absolute',
          display: 'block',
          padding: '0 5px',
          fontSize: '12px',
          wordWrap: 'break-word',
          width: text_w - 10,
          textAlign: 'center',
          height: '20px',
          lineHeight: '20px',
          left: text_w * j + (text_w / 2),
          bottom: '-20px',
          transform: 'scale(0.8)',
          transitionDelay:  j*0.2 + 's',
          color: cfg.canvasStyle && cfg.canvasStyle.textColor ? cfg.canvasStyle.textColor : '#000',
        });
        component.append(textDom);
      }
      
    }
    ctx.stroke();
  };

  // 画数据层
  // per 是0-1之间的小数
  // 根据per的参数变化来绘制数据，形成动画效果
  var ctx = creatCanvas();
  var drawData = function( per ) {
    ctx.clearRect(0, 0, w + 2, h + 2);

    ctx.beginPath();
    ctx.lineWidth = 3;
    // ctx.fillStyle = '#ff8878';
    ctx.strokeStyle = cfg.canvasStyle && cfg.canvasStyle.lineColor ? cfg.canvasStyle.lineColor : '#ff8878';
    // 画出数据点
    var x , y;
    // 计算网格间距_w
    var _w = w / (cfg.data.length + 1);
    for( var i = 0; i < cfg.data.length; i++) {
      // 让每个数据点都在竖线上
      // 这里需要多移动一个位置
      x = _w * i + _w;
      // 为什么这里需要这样计算
      // 这里需要清楚canvas坐标系
      y = h - (h * cfg.data[i].value * per);
      ctx.moveTo(x,y);
      ctx.arc(x, y, 5, 0, 2*Math.PI);
    }
    ctx.closePath();
    // ctx.fill();
    ctx.stroke();
    
    // 连接每个数据点
    ctx.beginPath();
    // 移动到第一个数据点
    ctx.moveTo( _w, h - (h * cfg.data[0].value * per) );
    for( var j = 0; j < cfg.data.length; j++) {
      x = _w * j + _w;
      y = h - (h * cfg.data[j].value * per);
      ctx.lineTo(x, y);
      // 写入数据到指定位置
      // 设置数据文本
      var text = cfg.data[j].value*100 + '%';
      // 获取文本的宽度
      var text_w = ctx.measureText(text).width;
      // 绘制文字，获取文本宽度是为了能居中绘制文本
      ctx.fillStyle = cfg.canvasStyle && cfg.canvasStyle.lineColor ? cfg.canvasStyle.lineColor : '#ff8878';
      ctx.fillText(text, x - (text_w / 2), y - 15);
    }
    ctx.stroke();
    // 绘制阴影
    // 这里有个小技巧，就是使用最后一个点的X坐标
    // 这里需要理解canvas中beinPath()
    // canvas在执行beinPath()后会清除掉所有的路径
    // 上面连接数据的路径执行绘制后，由于未重置路径
    // 所以这里只需要接着规划路径坐标即可
    // 同时这里也可以看出，canvas绘制路径时能够断点操作
    // 即可以在路径规划中绘制或填充，然后再继续绘制路径
    ctx.lineTo(x, h);
    ctx.lineTo(_w, h);
    // 阴影颜色
    ctx.fillStyle = cfg.canvasStyle && cfg.canvasStyle.shadowColor ? cfg.canvasStyle.shadowColor : 'rgba(255, 136, 120, .2)';
    ctx.fill();

  };

  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data ) {
    drawLine();
    //触发元素加载动画
    component.on('onLoad',function(){
      // 折线图生长动画
      // 这里是一个很巧妙的动画设计
      var s = 0;
      for( var i = 1; i <= 100; i++ ) {
        setTimeout( function() {
          s += 0.01;
          drawData( parseFloat( (s).toFixed(2) ) );
        }, i*10 + 500);
      }
      
    })
    .on('onLeave',function(){
      // 折线图退场动画
      var s = 1;
      for( var i = 1; i <= 100; i++ ) {
        setTimeout( function() {
          s -= 0.01;
          drawData( parseFloat( (s).toFixed(2) ) );
        }, i*5);
      }
    });

  }else{
    console.error('请加入数据，data:[{},....]');
  }

  return component;
};