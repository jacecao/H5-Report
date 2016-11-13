//饼图组件
var H5ComponentPie = function( setClass, cfg ) {

  //创建一个基本组件
  var baseCfg = $.extend({
    width: 2 * cfg.radius,
    height: 2 * cfg.radius
  }, cfg);
  var component = new H5ComponentBase( 'h5_component_pie ' + setClass, baseCfg );

  // 设置canvas宽度和高度
  var w = 2 * cfg.radius;
  var h = 2 * cfg.radius;
  
  // 创建一个随机颜色生成器
  var creatColor = function() {
    var color = {
      // 随机生成0-255之间的数
      r: Math.round(Math.random() * 256),
      g: Math.round(Math.random() * 256),
      b: Math.round(Math.random() * 256),
    };
    // 转换16进制颜色格式
    var toHex = function(val) {
      var hex;
      if( val ) {
        hex = parseInt(val).toString(16);
        // 不够2位加0补上
        if( hex.length == 1 ) {
          hex = '0' + hex;
        }
      }
      return hex;
    };

    return '#' + toHex(color.r) + toHex(color.g) + toHex(color.b);
  };
  
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
    component.append(canvas);
    return ctx;
  };

  var r = cfg.radius;
  // 需要绘制的数量
  var step = cfg.data.length;

  // 边框颜色              
  var color_border = cfg.canvasStyle && cfg.canvasStyle.borderColor ? 
                  cfg.canvasStyle.borderColor : creatColor();
  var border_width = 4;
  // 遮罩颜色              
  var color_mask = cfg.canvasStyle && cfg.canvasStyle.maskColor ? 
                  cfg.canvasStyle.maskColor : '#eee';                                                                  
  // 绘制饼图
  var drawPie = function() {
    var ctx = creatCanvas();
    ctx.beginPath();
    ctx.fillStyle = '#eee';
    ctx.strokeStyle = color_border;
    ctx.lineWidth = border_width;
    ctx.arc(r, r, r-border_width, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  // 画数据层
  // 数据层半径
  var R = r-border_width;
  var ctxData = creatCanvas({zIndex: 100});
  // 设置起始角度和结束角度
  // 设置起始位置为12点芳方向
  var startAngel = 1.5 * Math.PI;
  var endAngel = 0;
  var circleAngel = Math.PI * 2;
  // 绘制饼状数据
  for( var i =0; i < step; i++) {
    endAngel = startAngel + circleAngel * cfg.data[i].value;
    ctxData.beginPath();
    var COLOR = cfg.data[i].color ? cfg.data[i].color : creatColor();
    ctxData.fillStyle = COLOR;
    ctxData.strokeStyle = '#fff';
    ctxData.lineWidth = border_width;
    // 根据数据绘制圆弧
    ctxData.moveTo(r, r);
    ctxData.arc(r, r, R - border_width, startAngel, endAngel);
    ctxData.fill();
    ctxData.closePath();
    ctxData.stroke();
    /* 加入文本信息
    ** 文字颜色
    */
    var color_text =  cfg.canvasStyle && cfg.canvasStyle.textColor ? 
                      cfg.canvasStyle.textColor : COLOR; 
    var pieText = $('<div class = "pie_text">');
    pieText.text( cfg.data[i].text );
      // 设置样式
       pieText.css({
        position: 'absolute',
        zIndex: '200',
        color: color_text,
        // top: 'auto'
       });
    var piePer = $('<span class="pie_per">');
      // 设置样式
       piePer.css({
        padding: '10px 0 0 10px',
       });
    piePer.text( parseInt(cfg.data[i].value * 100) + '%' );
    pieText.append( piePer );
    // 计算文本位置
    // 将终点角度和起始角度相减/2 获取中间角度
    var mediumAngel = startAngel + ( endAngel - startAngel ) / 2;
    // 计算中间角度的XY坐标
    // 修正值
    var fix = 6;
    var x = R * Math.cos( mediumAngel ) + r;
    var y = R * Math.sin( mediumAngel ) + r;
    // 这里做这样判断的目的是为了巧妙化解文本DOM自身宽度对定位的影响
    // 可以想象设置left和right 其各自对终点的定义是不一样的
    // 定位left时其终点为DOM的左边位置，也就是文字的起始位置
    // 定位right时其终点为DOM的右边位置，也就是文字的末端位置
    if( x > r ) {
      pieText.css('left', x/2 + fix);
    }else {
      pieText.css('right', (w-x)/2 + fix);
    }
    if( y > r ) {
      pieText.css('top', y/2 + fix);
    }else {
      pieText.css('bottom', (h-y)/2 + fix);
    }

    pieText.appendTo( component );
    
    startAngel = endAngel;
  }
  
  // 加入遮罩层动画
  var ctxMask = creatCanvas({zIndex: 110});
  var draw = function( per ) {
    // 清理画布
    ctxMask.clearRect(0, 0, w, h);
    ctxMask.beginPath();
    ctxMask.fillStyle = color_mask;
    ctxMask.moveTo(r,r);

    if( per <= 0 ) {
      ctxMask.arc(r, r, r, 0, 2 * Math.PI);
    }else{
      /**
      ** 起始这里就是绘制一个圆弧，但圆弧的起点和终点是一个位置
      ** 所以这里只是为了展示一个绘制的过程
      ** 比较巧妙的解决了饼状图动画
      ** 这里不能使用stroke(),否则会在终点出现线条
      **/
      ctxMask.arc(r, r, r, startAngel, startAngel + circleAngel*per, true);
    }
    ctxMask.fill();
    // 当饼图加载完成后，检测文本是否需要重排
    if( per >= 1 ) {
      // 修改过渡时间 防止后面H5ComponentPie.reSort递归运算引起的BUG
      component.find('.pie_text').css('transition', 'all 0s ');
      H5ComponentPie.reSort( component.find('.pie_text') );
      component.find('.pie_text').css('transition', 'all 1s 500ms');
    }
  };

  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data && cfg.data.length > 0 ) {
    drawPie();
    draw(0);
    //触发元素加载动画
    component.on('onLoad',function(){
      // 生长动画
      var s = 0;
      for( var i = 1; i <= 100; i++ ) {
        setTimeout( function() {
          s += 0.01;
          /**
          ** 由于小数计算的复杂性
          ** 所以这里对计算结果要指定小数位数操作
          ** 减少2进制计算的精度
          ** toFixed()方法可把Number四舍五入为指定小数位数的数字。
          **/
          draw( parseFloat( (s).toFixed(2) ) );
        }, i*10 + 400);
      }
      
    })
    .on('onLeave',function(){
      // 退场动画
      var s = 1;
      for( var i = 1; i <= 100; i++ ) {
        setTimeout( function() {
          s -= 0.01;
          draw( parseFloat( (s).toFixed(2) ) );
        }, i*5 );
      }
    });

  }else{
    console.error('请加入数据，data:[{},....]');
  }

  return component;
};

// 重排项目文本元素
// 纠正当文本元素重叠时需要重排
H5ComponentPie.reSort = function( list ) {

  // 检测非完全重叠
  var compare = function( domA, domB ) {
    
    var offsetA = $(domA).offset();
    var offsetB = $(domB).offset();

    var shadowA_x = [ offsetA.left, $(domA).width() + offsetA.left];
    var shadowA_y = [ offsetA.top, $(domA).height() + offsetA.top];

    var shadowB_x = [ offsetB.left, $(domA).width() + offsetB.left];
    var shadowB_y = [ offsetB.top, $(domA).height() + offsetB.top];
    // debugger
    // 检测是否相交
    var intersect_x = ( shadowA_x[0] > shadowB_x[0] && shadowA_x[0] < shadowB_x[1]) ||
                      ( shadowA_x[1] > shadowB_x[0] && shadowA_x[1] < shadowB_x[1]);
    var intersect_y = ( shadowA_y[0] > shadowB_y[0] && shadowA_y[0] < shadowB_y[1]) ||
                      ( shadowA_y[1] > shadowB_y[0] && shadowA_y[1] < shadowB_y[1]);
    
    return intersect_x && intersect_y;

  };

  // 错开重排
  var reset = function( domA, domB ) {
    // debugger
    if( parseInt( $(domA).css('top') ) > parseInt( $(domA).css('bottom') ) ) {
      $(domA).css('top', parseInt( $(domA).css('top') )+ parseInt( $(domB).height() ) );
    }

    if( parseInt( $(domA).css('bottom') ) > parseInt( $(domA).css('top') ) ) {
      $(domA).css('bottom', parseInt( $(domA).css('bottom') ) + parseInt( $(domB).height() ) );
    }

  };

  // 将要重排的元素
  var willReset = [ list[0] ];
  $.each(list, function(i, dom) {
    if( compare( willReset[willReset.length-1], dom ) ) {
      willReset.push(dom);
    }
  });

  if(willReset.length > 1) {
    $.each(willReset, function(i, dom) {

      if( willReset[i+1] ) {
        reset(dom, willReset[i+1]);
      }
      // 递归循环
      H5ComponentPie.reSort(willReset);
    });
  }
  
};