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