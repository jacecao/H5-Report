//散点图组件
var H5ComponentPoint = function( setClass, cfg ) {

  //创建一个基本组件
  var component = new H5ComponentBase( setClass, cfg );


  //创建散点元素
  //必须要有data配置项，且该项目里一定要有value属性
  if( cfg.data && cfg.data[0].value) {

    //将第一组数据中的值作为比例参考点
    var base = cfg.data[0].value;

    //寻找最大值并存储该对象索引
    var maxObj = {max: null,index: null};
    $.each( cfg.data, function(index,item){
      if( item.value > maxObj.max ){
        maxObj.max = item.value;
        maxObj.index = index;
      }
    });

    //设置point默认样式
    var initCss = {
      'position': 'absolute',
      'border-radius': '50%'
    };

    //设置文字默认样式
    var _fontSize = cfg.css.fontSize || '18px';
    var textCss = {
      width: '100%',
      height: 30,
      fontSize: _fontSize,
      textAlign: 'center',
      position: 'absolute',
      top: '50%',
      marginTop: -15
    };

    $.each( cfg.data, function(index, item ){
      
      var point = $('<div class="h5_component_point"></div>');
      point.css(initCss);

      //加入文字说明
      var desc = $('<div class="point_text">'+ item.text +'</div>');
      //百分比数据
      var value_pre = $('<div class="point_pre">'+ (item.value*100) +'%</div>');
      value_pre.css('fontSize', '0.5em');

      desc.css(textCss).append(value_pre);
      point.append(desc);

      //根据参考值计算出相应的宽高比
      var pre = (item.value/base)*100 + '%';
      point.width( pre ).height( pre );
      //设置背景色
      item.color && point.css('backgroundColor', item.color);
      
      //设置相对component定位
      if( index == maxObj.index ){
        item.position && point.css( item.position ).css('zIndex','100');
      }else{
        //根据最大值的Point来定位其他Point
        //这里需要大的完全覆盖小的
        //所以 MAX.width/2+Max.top = min.top + min.width/2
        //MAX.width = max*min.width/min(这里的图形本来就有一个比例参考)
        //这里需要明白的就是如何推导出最大图形的宽度
        var offsetLeft = ( maxObj.max*point.width() / (item.value*2) ) + cfg.data[maxObj.index].position.left - point.width()/2;
        var offsetTop = ( maxObj.max*point.width() / (item.value*2) ) + cfg.data[maxObj.index].position.top - point.width()/2;
        point.css({
          'left': offsetLeft,
          'top': offsetTop
        }).css('zIndex','1');
        //将定位数据储存到该元素中
        point.data('position', {
            _top: offsetTop, 
            _left: offsetLeft, 
            top: item.position.top,
            left: item.position.left
        });

        //添加事件动画
        point.on('pointLoad', function(event){
          event.stopPropagation();
          $(this).animate({
            top: $(this).data('position').top,
            left: $(this).data('position').left
          });
        });

        point.on('pointLeave', function(event){
          event.stopPropagation();
          $(this).animate({
            top: $(this).data('position')._top,
            left: $(this).data('position')._left
          });
        });

      }

      component.append( point );

    });

    //触发散点元素加载动画
    component.on('onLoad',function(){
      component.find('.h5_component_point').trigger('pointLoad');
    })
    .on('onLeave',function(){
      component.find('.h5_component_point').trigger('pointLeave');
    });

  }else{
    console.error('请加入数据，data:[{},....]');
  }

  return component;
};