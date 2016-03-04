
不少人应该知道JS里可以用部分unicode字符来命名变量和方法。想想挺好玩的，不但可以用中文来编程，还可以用颜文字和emoji来编程，想想也是醉了。

不过还是不建议在真实项目中这样做，但是这并不代表不可以用嘛。

今天，跟大家介绍一下我写的一个《英文代码翻译器》可以用一句命令，把你的js代码翻译成中文变量命名并且还可以运行的js代码！

虽然这个项目只是开个玩笑，单其中涉及到的几个技术要点，还是值得一说的。本文主要分以下几节：

介绍 | 代码编译 | 翻译 | 全局变量处理 | 重复翻译结果处理 | 小结

###介绍

github地址：https://github.com/xinyu198736/hancode

使用方式：

```bash
sudo npm install hancode -g;

#定位到某个目录

hancode -s ./code.js

#会在当前目录生成一个 code.汉.js

#code.汉.js 的代码其实就是本库的中文版，测试可以跑通，并且结果一样。

```

一个编译后的在线地址：http://f2e.souche.com/assets/js/souche.%E6%B1%89.js

本库主代码编译后的结果：

```javascript
var 丑化JS = require("uglify-js");

var _ = require("underscore");

var 翻译工具 = require("./translate_util");

var 翻译对象 = {};

module.exports = function(源代码, 回调) {
    var AST的代码 = 丑化JS.parse(源代码);
    var 无功节点 = [];
    var 参考节点 = [];
    var 跨语言 = [];
    AST的代码.walk(new 丑化JS.TreeWalker(function(结) {
        if (结 instanceof 丑化JS.AST_SymbolVar) {
            无功节点.push(结);
            跨语言.push(结.name);
        }
    }));
    AST的代码.walk(new 丑化JS.TreeWalker(function(结) {
        if (结 instanceof 丑化JS.AST_SymbolRef) {
            if (跨语言.indexOf(结.name) != -1) {
                参考节点.push(结);
                跨语言.push(结.name);
            }
        }
    }));
    跨语言 = _.uniq(跨语言);
    console.log("翻译中");
    翻译工具(跨语言, function(E, 结果) {
        翻译对象 = 结果;
        使uniq对象(翻译对象);
        无功节点.forEach(function(结) {
            结.name = 翻译对象[结.name] || 结.name;
        });
        参考节点.forEach(function(结) {
            结.name = 翻译对象[结.name] || 结.name;
        });
        回调(null, AST的代码.print_to_string({
            beautify: true
        }));
    });
};

var 使uniq对象 = function(obj) {
    var 扫描值 = [];
    for (var 我 in obj) {
        var 价值 = obj[我];
        if (扫描值.indexOf(价值) != -1) {
            var 重复计数 = 0;
            扫描值.forEach(function(v) {
                if (v == 价值) {
                    重复计数++;
                }
            });
            obj[我] = 价值 + "_" + 重复计数;
        }
        扫描值.push(价值);
    }
};
```

###代码编译

AST这个名词相信很多人都接触过，在做代码压缩的时候，都是先把js转换成AST语法树，然后操作ast语法树，最后再把ast语法树组装回代码，这样做的安全性比较高，比用单纯的正则匹配精确很多，之前我做过一个拆分代码拼接图案的库，用状态机自己写的，中间处理了很多兼容和条件，而且还不能百分百确保正确，而用AST的话其实就简单很多了。

关于编译理论的知识，说起来实在太长，这里就不深入了，主要讲讲我如何利用其替换js中的变量的。

现在比较流行的JS解析器主要是：(https://github.com/mishoo/UglifyJS2)[UglifyJS2]

UglifyJS2的主要功能其实是用来压缩js代码，不过他的压缩过程大概分了三步：parse,transform,generate code；平常我们可能并不需要关心这三步，一个方法就能搞定，不过稍微研究下就会发现，这三步拆分开很有意思，特别是transform这一步，我们可以替换成自己的逻辑，然后做很多改编代码行为的事情。

看我们的实现代码：

```
var UglifyJS = require("uglify-js");
//解析ast
var ast_code = UglifyJS.parse(source_code); 

//遍历ast，找出所有定义的变量
//为何分成两次，为了排除没有定义而直接使用的全局变量
ast_code.walk(new UglifyJS.TreeWalker(function(node){
    //如果是变量定义的节点
    if(node instanceof UglifyJS.AST_SymbolVar){
        varNodes.push(node);
        for_trans_words.push(node.name);
    }
}));
ast_code.walk(new UglifyJS.TreeWalker(function(node){
    if(node instanceof UglifyJS.AST_SymbolRef){
        if(for_trans_words.indexOf(node.name)!=-1){
            refNodes.push(node);
            for_trans_words.push(node.name);
        }
    }
}));
... 处理替换ast节点中的name

//生成最终代码
ast_code.print_to_string({
    beautify:true
})    

```

解析和生成代码，UglifyJS都已经帮我们做好了，我们需要做的就是利用 UglifyJS.TreeWalker 来遍历所有的AST节点，判断其类型，然后替换或者转换。

我们这次的需求其实很简单，就是找到某些节点，把他们的name翻译成中文。

具体的实现见github。

###翻译

hancode使用百度翻译来翻译英文到中文。事实上百度翻译支持很多语言的互译，使用也很简单。

百度翻译有专门的云服务平台，地址如下：http://api.fanyi.baidu.com/api/trans/product/index

前端乱炖的url seo也是用的这个api。

###全局变量处理

这个库里面有一些小细节，例如有些变量是全局变量，但是AST里并没有标记出来，需要自己判断，如果判断有Ref但是没有定义的变量，即为全局变量，例如 require/console 之类的。

这就是上面的代码片段中为何要遍历两次ast的原因。

###重复翻译结果处理

这也是一个细节，如果两个变量的意思很接近，可能会被翻译成同一个结果，如果直接使用会造成代码错乱。

其实一个简单的方法就可以处理：

```
/**
 * 把一个object里的value都变成唯一的，如果不是唯一的，给他加_1，如果出现两次则_2
 * @param obj
 */
var makeUniqObject = function(obj){
    var scaned_values = []
    for(var i in obj){
        var value = obj[i];
        if(scaned_values.indexOf(value)!=-1){
            var repeat_count = 0;
            scaned_values.forEach(function(v){
                if(v==value){
                    repeat_count++;
                }
            })
            obj[i] = value+"_"+repeat_count
        }
        scaned_values.push(value);
    }
}
```

###结语

这个项目其实没什么高深的，但是的确挺好玩，可以拿去唬人。

