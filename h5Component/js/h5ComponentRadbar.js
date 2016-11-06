//雷达图组件
var H5ComponentRadbar = function( setClass, cfg ) {

  //创建一个基本组件
  var baseCfg = $.extend({
    width: 2 * cfg.radius,
    height: 2 * cfg.radius
  }, cfg);
  var component = new H5ComponentBase( 'h5_component_radbar ' + setClass, baseCfg );

  // 设置canvas宽度和高度
  var w = 2 * cfg.radius;
  var h = 2 * cfg.radius;
  // 创建canvasDOM
  var creatCanvas = function( css ) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    // 设置canvasc样式
    var _css = $.extend(css, {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%'
    });
    $(canvas).css(_css);
    var ctx = canvas.getContext('2d');
    // 设置绘制文字的大小和字体
    ctx.font = '20px Arial';

    component.append(canvas);
    return ctx;
  };

  var r = cfg.radius;
  // 需要绘制网格的数量
  var step = cfg.data.length;
  // 网格背景
  var color_a = cfg.canvasStyle && cfg.canvasStyle.backgroundColor && cfg.canvasStyle.backgroundColor[0] ? 
                cfg.canvasStyle.backgroundColor[0] : '#7dced6';
  var color_b = cfg.canvasStyle && cfg.canvasStyle.backgroundColor && cfg.canvasStyle.backgroundColor[1] ? 
                cfg.canvasStyle.backgroundColor[1] : '#30afbb';
  // 雷达扇骨颜色              
  var color_c = cfg.canvasStyle && cfg.canvasStyle.borderColor ? 
                  cfg.canvasStyle.borderColor : '#abd5da';
  // 数据折线颜色
  var color_d = cfg.canvasStyle && cfg.canvasStyle.lineColor ? 
                  cfg.canvasStyle.lineColor : '#ff5722';
  // 数据阴影颜色
  var color_e = cfg.canvasStyle && cfg.canvasStyle.shadowColor ? 
                  cfg.canvasStyle.shadowColor : 'rgba(255,87,34,0.68)';
                                                          
  // 绘制雷达图网格
  var drawLine = function() {
    
    var ctx = creatCanvas();
    // 计算验证
    // ctx.beginPath();
    // ctx.arc(r, r, 5, 0, 2*Math.PI);
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.arc(r , r, r-5, 0, 2*Math.PI);
    // ctx.stroke();
    
    var isColor = false;
    for( var scale = 10; scale > 0; scale-- ) {
      ctx.beginPath();
      // 计算圆上的坐标值
      // 根据三角函数知道 y = sinA * r, x = cosA * r,
      // 知道圆心坐标、半径、角度
      // 角度 （360 / 数据个数） * i
      for( var i = 0; i < step; i++) {
        // 将2π转换平分到360°，再计算每份角度是多少，最后获取到实际角度
        var deg = ( 2*Math.PI / 360 ) * (360 / step) * i;
        var R = r - 5;
        var x = r + Math.cos(deg) * R * scale / 10;
        var y = r + Math.sin(deg) * R * scale / 10;
        // 在指定角度获知一个圆圈
        // ctx.arc(x, y, 5, 0, 2*Math.PI);
        // ctx.moveTo(r, r);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = (isColor = !isColor) ? color_a : color_b;
      ctx.fill();
    }

    // 绘制扇骨
    ctx.beginPath();
    // 存储每个雷达图的点坐标
    var point = [];
    for( var j = 0; j < step; j++) {
      var _deg = ( 2*Math.PI / 360 ) * (360 / step) * j;
      var _R = r - 5;
      var _x = r + Math.cos(_deg) * _R;
      var _y = r + Math.sin(_deg) * _R;
      ctx.moveTo(r, r);
      ctx.lineTo(_x, _y);
      point.push({
        x: r + Math.cos(_deg) * r,
        y: r + Math.sin(_deg) * r,
      });
    }
    ctx.strokeStyle = color_c;
    ctx.stroke();

    // 创建文本DOM到组件
    // console.log(point);
    for( var k = 0; k < point.length; k++ ) {
      var textDom = $('<span class="radbar_text"></span>');
      textDom.text( cfg.data[k].text );
      textDom.css({
        position: 'absolute',
        display: 'block',
        padding: '5px',
        fontSize: '16px',
        wordWrap: 'break-word',
        textAlign: 'center',
        width: '50px',
        transform: 'scale(0.8)',
        transitionDelay:  k*0.3 + 's',
        color: cfg.canvasStyle && cfg.canvasStyle.textColor ? cfg.canvasStyle.textColor : '#000',
      });
      // 这里对文本元素对位是一件很困难的事情
      // 这里不是一个完美的解决方案
      // 根据需要显示的位置来分析文字应该定位的点
      if( point[k].y == r ) {
        textDom.css({
          left: Math.ceil(point[k].x) / 2  - 10,
          bottom: ( h - Math.floor(point[k].y) ) / 2,
        });
      }else{
        if(point[k].x > w/2) {
          textDom.css({
            left: Math.ceil(point[k].x) / 2 - 25,
          });
        }else {
          textDom.css({
            right:  ( w - Math.floor(point[k].x) ) / 2 -25,
          });
        }
        if( point[k].y > h/2) {
          textDom.css({
            top: Math.ceil(point[k].y) / 2 - 5,
          });
        }else {
          textDom.css({
            bottom: ( h - Math.floor(point[k].y) ) / 2 - 5,
          });
              }
      } 
      component.append(textDom);
    }

  };

  // 画数据层
  // per 是0-1之间的小数
  // 根据per的参数变化来绘制数据，形成动画效果
  var ctxData = creatCanvas({zIndex: 100});
  
  var drawData = function( per) {
    // 清理画布
    ctxData.clearRect(0, 0, w, h);
    ctxData.strokeStyle = color_d;
    ctxData.fillStyle = color_e;
    ctxData.beginPath();
    var point = [];
    // 连接所有的数据点
    for( var i = 0; i < step; i++) {
      var deg = ( 2*Math.PI / 360 ) * (360 / step) * i;
      var R = r - 5;
      var data = cfg.data[i].value * per;
      var x = r + Math.cos(deg) * R * data;
      var y = r + Math.sin(deg) * R * data;
      ctxData.lineTo(x, y);
      point.push({
        x: x,
        y: y,
      });
    }
    ctxData.closePath();
    ctxData.stroke();
    ctxData.fill();
    
    // 绘制数据点
    ctxData.fillStyle = color_d;
    for( var j = 0; j < point.length; j++) {
      ctxData.beginPath();
      ctxData.arc(point[j].x, point[j].y, 5, 0, 2*Math.PI);
      ctxData.closePath();
      ctxData.fill();
    }

    // 绘制数据扇骨
    ctxData.beginPath();
    for( var k = 0; k < point.length; k++) { 
      ctxData.moveTo(r, r);
      ctxData.lineTo(point[k].x, point[k].y);
    }
    ctxData.stroke();

  };

  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data && cfg.data.length > 0 ) {
    drawLine();
    //触发元素加载动画
    component.on('onLoad',function(){
      // 雷达图生长动画
      var s = 0;
      for( var i = 1; i <= 100; i++ ) {
        setTimeout( function() {
          s += 0.01;
          drawData( parseFloat( (s).toFixed(2) ) );
        }, i*10 + 400);
      }
      
    })
    .on('onLeave',function(){
      // 雷达图退场动画
      var s = 1;
      for( var i = 1; i <= 100; i++ ) {
        setTimeout( function() {
          s -= 0.01;
          drawData( parseFloat( (s).toFixed(2) ) );
        }, i*5 );
      }
    });

  }else{
    console.error('请加入数据，data:[{},....]');
  }

  return component;
};