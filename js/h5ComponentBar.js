//柱状图组件
var H5ComponentBar = function( setClass, cfg ) {

  //创建一个基本组件
  var component = new H5ComponentBase( setClass, cfg );


  //创建散点元素
  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data ) {

    //获得数据的长度，根据长度来确定每个数据的平均高度
    var dataSum = cfg.data.length;
    var aveHeight = Math.floor( component.width()/dataSum );

    $.each( cfg.data, function(index, item ){

      var line = $('<div class="h5_component_bar_line bar_line">');
      var name = $('<div class="name">');
      var rate = $('<div class="rate">');
      var _process = $('<div class="process">');
      var per = $('<div class="per">');

      var width = item.value*100 + '%';

      //设置line用户样式;
      cfg.process && cfg.process.css && line.css( cfg.process.css );

      //设置rate和process颜色
      rate.css({
        backgroundColor: cfg.process && cfg.process.color[0] || '#1a1919',
      });
      _process.css({
        backgroundColor: cfg.process &&  cfg.process.color[1] || '#f44336',
      });

      name.text( item.text );
      per.text( width );

      rate.append( _process );
      line.append( name ).append( rate ).append( per );


      //设置柱状图进度宽度
      line.on('lineLoad', function() {
        _process.css('width', width);
      });
      line.on('lineLeave', function() {
        _process.css('width', 0);
      });

      component.append( line );

    });

    //触发散点元素加载动画
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