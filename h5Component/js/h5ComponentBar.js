//柱状图组件
var H5ComponentBar = function( setClass, cfg ) {

  //创建一个基本组件
  var component = new H5ComponentBase( 'h5_component_bar ' + setClass, cfg );


  //创建进度条DOM
  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data ) {

    //获得数据的长度，根据长度来确定每个数据的平均宽度和高度
    var dataSum = cfg.data.length;
    var aveWidth = Math.floor( component.width()/dataSum );
    var direction = cfg.direction ? cfg.direction : 'row';

    $.each( cfg.data, function(index, item ){
      
      var line;

      var name = $('<p class="name">');
      var rate = $('<div class="rate">');
      var _process = $('<div class="process">');
      var per = $('<div class="per">');

      var width = item.value*100 + '%';

      //设置rate和process颜色
      rate.css({
        backgroundColor: cfg.process.color && cfg.process.color[0] || '#1a1919',
      });
      _process.css({
        backgroundColor: cfg.process.color &&  cfg.process.color[1] || '#f44336',
      });

      name.text( item.text );
      // 对文字添加用户样式
      name.css(cfg.textCss || {});
      // 数据显示跟进度条颜色一样
      per.text( width ).css('color', cfg.process &&  cfg.process.color[1]);

      rate.append( _process );
      
      switch (direction) {
        case 'row':
          line = $('<div class="h5_component_bar_row bar_line">');
          line.append( name ).append( rate ).append( per );
          //设置柱状图进度宽度
          line.on('lineLoad', function() {
            _process.css('width', width);
          });
          line.on('lineLeave', function() {
            _process.css('width', 0);
          });
          break;
        case 'column':
          line = $('<div class="h5_component_bar_column bar_line">');
          line.width(aveWidth);

          rate.height( Math.floor(cfg.height*0.6) || 200 );
          //设置line的用户样式;
          cfg.process && cfg.process.css && rate.css( cfg.process.css );

          line.append( per ).append( rate ).append( name );
          //设置柱状图进度高度
          line.on('lineLoad', function() {
            _process.css('height', width);
          });
          line.on('lineLeave', function() {
            _process.css('height', 0);
          });
          break;  
      }

      component.append( line );

    });

    //触发元素加载动画
    component.on('onLoad',function(){
      component.find('.bar_line').trigger('lineLoad');
    })
    .on('onLeave',function(){
      component.find('.bar_line').trigger('lineLeave');
    });

  }else{
    console.error('请加入数据，data:[{},....]');
  }

  return component;
};