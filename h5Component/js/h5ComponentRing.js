//环形图组件
var H5ComponentRing = function( setClass, cfg ) {

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

  // 边框颜色              
  var color_border = cfg.canvasStyle && cfg.canvasStyle.borderColor ? 
                  cfg.canvasStyle.borderColor : creatColor();
  var border_width = 4;
  // 背景色设置
  var color_background = cfg.canvasStyle && cfg.canvasStyle.backgroundColor ? 
                  cfg.canvasStyle.backgroundColor : 'rgba(170,170,170,0.5)';
  // 遮罩颜色              
  var color_mask = cfg.canvasStyle && cfg.canvasStyle.maskColor ? 
                  cfg.canvasStyle.maskColor : creatColor();                                                                  
  // 绘制饼图
  var drawPie = function( cfg ) {
    var ctx = cfg.css ? creatCanvas(cfg.css) : creatCanvas();
    ctx.beginPath();
    ctx.fillStyle = cfg.backgroundColor || color_background;
    ctx.lineWidth = border_width;
    ctx.arc(r, r, cfg.radius, 0, 2*Math.PI);
    ctx.fill();
    return ctx;
  };

  // 画数据层,根据数据绘制户型
  // 数据层半径
  var R = r-border_width;
  // 设置起始角度和结束角度
  // 设置起始位置为12点芳方向
  var startAngel = 1.5 * Math.PI;
  var endAngel = 0;
  var circleAngel = Math.PI * 2;
  // 环状颜色
  var COLOR = cfg.data.color ? cfg.data.color : creatColor();
  var ctxData = creatCanvas({css: {zIndex: 100}});
  var drawRing = function( per ) {
    // 创建一个beferred对象
    var def = $.Deferred();
    // 清空canvas 
    ctxData.clearRect(0, 0, w, h);
    // 绘制饼状数据
    endAngel = startAngel + circleAngel * cfg.data.value*per;
    ctxData.beginPath(); 
    ctxData.fillStyle = COLOR;
    // 根据数据绘制圆弧
    ctxData.moveTo(r, r);
    ctxData.arc(r, r, R, startAngel, endAngel);
    ctxData.fill();
    ctxData.closePath();
    // 判断是否完成动画
    if( per == 1 ) {
      // 当动画完成后改变Deferred()对象的状态为完成状态
      def.resolve();
    }
    /*
    ** 返回一个Deferred()的promise()对象
    ** 将程序执行状态回传给后面的处理函数
    */
    return def.promise();
  };
   
  // 绘制中心覆盖圆构造为圆环并绘制文本信息
  var ringWidth = cfg.canvasStyle && cfg.canvasStyle.ringWidth ? 
                  cfg.canvasStyle.ringWidth : parseInt(r/5);
  // 显示文本和数字得填充色
  var FillStyle = cfg.canvasStyle && cfg.canvasStyle.textColor ? 
                  cfg.canvasStyle.textColor : COLOR;        
  var drawTopRing = function() {
    // 创建遮罩圆
    var ctx = drawPie({radius: r-ringWidth, css: {zIndex: 200}, backgroundColor: color_mask});
    ctx.beginPath();
    // 绘制文字得大小和字体
    ctx.font = cfg.canvasStyle && cfg.canvasStyle.textFont ? 
                  cfg.canvasStyle.textFont + ' Arial' : '24pt Arial';
    var textWidth = ctx.measureText( cfg.data.text ).width;
    ctx.fillStyle = FillStyle;
    return {
      ctx: ctx,
      x: r - textWidth / 2,
      y: r - ringWidth,
    };
    
  };

  // 绘制数据文字显示
  var canvas_data = creatCanvas({zIndex: 300});
  canvas_data.font = r/5 + 'pt Arial';
  canvas_data.fillStyle = FillStyle;
  var drawDataText = function( per ) {
      canvas_data.clearRect(0, 0, w, h);
      canvas_data.beginPath();
      // 注意这里需要使用parseInt(),防止浮点数计算造成得多个零出现
      var dataText = parseInt( (cfg.data.value*100*per) ) + '%';
      // 获取需要绘制文字得宽度
      // 注意measureText()只能测量宽度
      var textWidth = canvas_data.measureText( dataText ).width;
      canvas_data.fillText(dataText, r - textWidth / 2, r + ringWidth);
  };
  
  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data && cfg.data.value ) {
    drawPie( {radius: r-border_width} );
    /* 
    ** 再次得到绘制信息文本得cavas,
    ** 这里的ctx是一个含有文字文本坐标信息的对象 
    */
    var canvasText = drawTopRing();
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
          var def = drawRing( parseFloat( (s).toFixed(2) ) );
          drawDataText( parseFloat( (s).toFixed(2) ) );
          /*
          ** 在环状动画完成后显示文字
          ** 注意这里使用了jQuery的Deferred对象了实现该操作
          */
          $.when(def).done( function() {
            canvasText.ctx.fillText(cfg.data.text, canvasText.x, canvasText.y);
          });
        }, i*10 + 400);
      }
      
    })
    .on('onLeave',function(){
      // 退场动画
      var s = 1;
      for( var i = 1; i <= 100; i++ ) {
        setTimeout( function() {
          s -= 0.01;
          drawRing( parseFloat( (s).toFixed(2) ) );
          drawDataText( parseFloat( (s).toFixed(2) ) );
        }, i*5 );
      }
    });

  }else{
    console.error('请加入数据配置，data:{value: floatnumber,text: ".."}');
  }

  return component;
};