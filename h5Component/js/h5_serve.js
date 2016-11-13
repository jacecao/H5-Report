// XMLHttpRequest实现h5自动加载组件
// 只需要引入h5.js文件即可

var H5 = function() {

  // 加入loding组件
  var h5_loading = $('<div class="h5_loading"></div>');
  var circle = $('<div class="circle-1"></div><div class="circle-2"></div>');
  var loading_rate = $('<div id="loading_rate">0%</div>');
  var h5_loading_process = $('<div class="h5_loading_process"><div class="process_bar"></div></div>');
  circle.appendTo( h5_loading );
  loading_rate.appendTo( h5_loading );
  h5_loading_process.appendTo( h5_loading );
  h5_loading.appendTo( 'body' );

  // 获取h5.js的加载路径
  var Root = null;
  var _index = null;
  $('script').each(function(i) {
    var _src = $(this).attr('src');
    if( _src ) {
      _index = _src.indexOf('h5_serve.js');
    }
    if( _src && _index > 0 ) {
      Root = _src.slice(0, -14);
      // console.log(Root);
      return;
    }
  });
  // 首先加入H5基本样式表
    var _css_loading = $('<link rel="stylesheet" href="'+Root+'css/loading.css">');
    _css_loading.appendTo('head');
    var _css_base = $('<link rel="stylesheet" href="'+Root+'css/h5Base.css">');
    _css_base.appendTo('head');
  // 加入基本组件JS到页面中
  // 这里就有意思了
  var loadingJS = $('<script src="'+Root+'js/H5_loading.js">');
  loadingJS.appendTo('head');
  var baseJS = $('<script src="'+Root+'js/H5ComponentBase.js">');
  baseJS.appendTo('head');  
  // 检查组件是否加入
  this.checkComponent = function(type) {
    if(!this[type]) {
      this[type] = type;
      var addJS = $('<script src="'+Root+'js/H5Component'+type+'.js">');
      addJS.appendTo('body');
    }
  };

  //取得一个随机数来作为id取值，这里保留小数点后3位
  var _id = Math.round( ( Math.random()*1000 ) ) / 1000;
  //替换小数点位下划线
  this.id = ('h5_' + _id).replace('.','_'); 
  
  this.ele = $('<div class="h5" id="'+ this.id +'"></div>').hide();
  $('body').append(this.ele);

  this.page = [];
  this.loader = (typeof H5_loading === 'function' ? H5_loading : this.loader);
  return this;

};

H5.prototype = {

  // 添加H5页面
  addPage: function(setClass, text) {

    var _page = $('<div class="h5_page section"></div>');

    setClass && _page.addClass('h5_page_'+setClass);
    text && _page.text(text);
    // 注意这里是this.ele里加入page
    this.ele.append(_page);
    
    // 获取所有的h5_page
    this.page.push( _page );

    // 当增加一个页面时执行一个指定函数
    if( typeof this.whenAddPage === 'function') {
      this.whenAddPage();
    }

    return this;

  },
  // 添加每页的组件
  addComponent: function(setClass, cfg) {
    // 检查传入的参数
    if( cfg === undefined || arguments.length === 1 ) {
      switch (typeof arguments[0]) {
        case 'object':
          cfg = arguments[0];
          setClass = null;
          break;
        case 'string':
          cfg = {};
          break; 
      }  
    }
    var config = cfg || {};
    config = $.extend({
      //添加默认配置
      type: 'base'
    },cfg);

    var component;
    switch( config.type.toLowerCase() ) {
      case 'base':
        component = new H5ComponentBase(setClass, config);
        break;
      case 'bar':
        // 是否加入了bar组件
        this.checkComponent('Bar');
        component = new H5ComponentBar(setClass, config);
        break;
      case 'radbar':
        this.checkComponent('radbar');
        component = new H5ComponentRadbar(setClass, config);
        break;
      case 'pie':
        this.checkComponent('pie');
        component = new H5ComponentPie(setClass, config);
        break;
      case 'point':
        this.checkComponent('point');
        component = new H5ComponentPoint(setClass, config);
        break;
      case 'polyline':
        this.checkComponent('polyline');
        component = new H5ComponentPolyline(setClass, config);
        break;
      case 'ring':
        this.checkComponent('ring');
      component = new H5ComponentRing(setClass, config);
      break;  
    }

    //将组件添加到指定创建的页面
    //这里使用链式调用，所以指的是上一步刚创建的page页面
    //如何获取刚创建的page页面？这里就用到this.page
    //这里通过slice来取得最后一个h5_page对象
    var page = this.page.slice(-1)[0];
    page.append(component);

    return this;

  },
 // 初始化页面加载
  loader: function( indexpage ) {

    this.ele.fullpage({
      /* 默认 index、nextIndex 和 direction 3个参数：
      ** index 是离开的“页面”的序号，从1开始计算；
      ** nextIndex 是滚动到的“页面”的序号，从1开始计算；
      ** direction 判断往上滚动还是往下滚动，值是 up 或 down
      */
      'onLeave': function(index, nextIndex, direction) {
        $(this).find('.h5_component').trigger('onLeave');
      },
      //anchorLink 是锚链接的名称，index 是序号，从1开始计算
      'afterLoad': function(anchorLink, index) 
      {
        $(this).find('.h5_component').trigger('onLoad');
      }

    });
    this.ele.show();
    // 加载指定的页面
    if( indexpage ) {
      $.fn.fullpage.moveTo( indexpage );
    }
    
  }

};