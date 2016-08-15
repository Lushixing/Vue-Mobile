var Util = {
    //获取模板内容
    tpl : function (id){
        return document.getElementById(id).innerHTML;
    },
    ajax : function (url , fn){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function (){
            if(xhr.readyState == 4){
                if(xhr.status == 200 || xhr.status == 304){
                    fn && fn(xhr.responseText)
                }
            }
        }
        xhr.open('GET' , url , true);
        xhr.send();
    }
}

//处理价格的过滤器
Vue.filter('price' , function (value){
    return value + '元';
});

//处理门市价的过滤器
Vue.filter('orignPrice' , function (value){
    return '门市价：' + value + '元';
});

//处理销售的过滤器
Vue.filter('sales' , function (value){
    return '已售' + value ;
});

//处理显示更多的过滤器
Vue.filter('loadMore' , function (value){
    return '查看其他' + value + '条团购';
});

var Home = Vue.extend({
    
    template : Util.tpl('tpl_home'),
    data : function(){
        return {
            types : [
                {id: 1, title: '美食', url: '01.png'},
                {id: 2, title: '电影', url: '02.png'},
                {id: 3, title: '酒店', url: '03.png'},
                {id: 4, title: '休闲娱乐', url: '04.png'},
                {id: 5, title: '外卖', url: '05.png'},
                {id: 6, title: 'KTV', url: '06.png'},
                {id: 7, title: '周边游', url: '07.png'},
                {id: 8, title: '丽人', url: '08.png'},
                {id: 9, title: '小吃快餐', url: '09.png'},
                {id: 10, title: '火车票', url: '10.png'}
            ],
            ad : [],
            list : []
        }
    },
    created : function (){
        var self = this;
        //hideSearch 设置成true来设置search的显示
        this.$parent.hideSearch = true;
        //hideBack 设置成false来设置back的隐藏
        this.$parent.hideBack = false;
        //hideSlider 设置成true来设置slider的显示
        this.$parent.hideSlider = true;
        Util.ajax('data/home.json' , function (res){
            //将返回的数据转化为json对象
            res = JSON.parse(res);
            if(res.errno == 0){
                //添加广告数据
                self.$set('ad' , res.data.ad);
                //添加列表数据
                self.$set('list' , res.data.list);
            }
        })
    }
})
var List = Vue.extend({
    template : Util.tpl('tpl_list'),
    data : function (){
        return {
            types: [
                {value: '价格排序', key: 'price'},
                {value: '销量排序', key: 'sales'},
                {value: '好评排序', key: 'evaluate'},
                {value: '优惠排序', key: 'discount'}
            ],
            list : [],
            other : []
        }
    },
    events : {
        'reload-list' : function (){
            this.load();
        }
    },
    created : function (){
        //hideSearch 设置成true来设置search的显示
        this.$parent.hideSearch = true;
        //hideBack 设置成true来设置back的显示
        this.$parent.hideBack = true;
        //hideSlider 设置成false来设置slider的隐藏
        this.$parent.hideSlider = false;
        this.load();
    },
    methods : {
        load : function (){
            var self = this;
            //通过parent的query数据我们可以拿到hash上的信息，来拼凑请求query
            var query = self.$parent.query;
            //拼凑query字符串
            var queryStr = '';
            if(query && query.length == 2){
                queryStr = '?' + query[0] + '=' + query[1];
            }
            // console.log(queryStr);
            //请求列表数据渲染到页面中
            Util.ajax('data/list.json' + queryStr , function (res){
                //将res转换为json对象
                res = JSON.parse(res);
                if(res.errno == 0){
                    //打乱返回数据的顺序
                    res.data.sort(function (){
                        return Math.random() > .5 ? 1 : -1
                    })
                    //前三个保存在list中
                    self.$set('list' , res.data.slice(0,3));
                    //后面的保存在other
                    self.$set('other' , res.data.slice(3))
                }
            })
        },
        //为查看更多按钮绑定事件
        loadMore : function (){
            //把剩余的other的商品放入list中
            this.list = [].concat(this.list , this.other);
            //将other清空
            this.other = [];
            // console.log(this.list)
        },
        sortBy : function (key){
            //点击排序按钮 , 对list排序
            //price sales evaluate 这三个属性，是list列表中每个成员对象中属性，所以我们可以根据该属性对列表成员排序
            // console.log(key)
            this.list.sort(function (a , b){
                if(key == 'discount'){
                    return (b.orignPrice - b.price) - (a.orignPrice - a.price)
                }else if(key == 'price'){
                    // 由小到大排序
                    return a[key] - b[key]
                   
                }else{
                    //  由大到小排序
                    return b[key] - a[key]
                }
            })
        }
    }
})
var Product = Vue.extend({
    template : Util.tpl('tpl_product'),
    data : function (){
        return {
            product : {
                src : '01.jpg'
            }
        }
    },
    created : function (){
        // 备份this
        var self = this;
        //hideSearch 设置成false来设置search的隐藏
        this.$parent.hideSearch = false;
        //hideBack 设置成true来设置back的显示
        this.$parent.hideBack = true;
        //hideSlider 设置成false来设置slider的隐藏
        this.$parent.hideSlider = false;
        Util.ajax('data/product.json' , function (res){
            //将res转换成json对象
            res = JSON.parse(res);
            if(res.errno == 0){
                //将res的data的数据保存在product中
                self.$set('product' , res.data);
            }
        })
    }
})

Vue.component('home' , Home);
Vue.component('list' , List);
Vue.component('product' , Product);

var app = new Vue({
    el : '#app',
    data : {
        view : '',
        query : [],
        hideSearch : true,  //搜索框的显示与隐藏
        hideBack : false, //返回键的显示与隐藏
        hideSlider : true,  //侧边栏的显示与隐藏
        navisopen : false //控制侧边栏的变量
    },
    methods : {
        search : function (e){
            var value = e.target.value;
            // console.log(value)
            // 将value放在hash上 #list/search/value
            location.hash = '#list/search/' + value;
        },
        goBack : function (e){
            //点击返回按钮返回上一级页面
            window.history.go(-1)
        }
    }
})

//路由
var route = function (){
    // var hash = location.hash.slice(1);
    var hash = location.hash;
    //处理字符串 #list/type/1 => list
    hash = hash.slice(1).replace(/^\// , '');
    // 将字符串转换成数组
    hash = hash.split('/');

    //列表页失效问题产生的原因
    //当列表页的view组件是list(app.view) , 搜索后得到的view组件还是list(hash[0])
    if (app.view === hash[0] && hash[0] === 'list') {
        // 父组件向子组件发送消息 成功通过父组件app向子组件发送消息
        app.query = hash.slice(1)
        app.$broadcast('reload-list')
        return ;
    }
    // console.log(hash);
    //根据hash选择视图组件
    app.view = hash[0] || 'home';
    app.query = hash.slice(1);
}

//对hash改变注册事件
window.addEventListener('hashchange' , route);
window.addEventListener('load' , route);

