var UglifyJS = require("uglify-js");
var _ = require("underscore");

var translate_util = require("./translate_util")
var translate_obj = {}





module.exports = function(source_code,callback){
    var ast_code = UglifyJS.parse(source_code); //解析ast
    var varNodes = [] //定义
    var refNodes = [] //引用
    var for_trans_words = [] //需要百度翻译的单词

    /*--------遍历ast，找出所有定义的变量-----*/
    ast_code.walk(new UglifyJS.TreeWalker(function(node){
        //console.log(Object.getPrototypeOf(node).TYPE
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


    for_trans_words = _.uniq(for_trans_words);
    /*--------找出所有需要翻译的单词---------*/
    console.log("翻译中");
    translate_util(for_trans_words.join("\n"),function(e,result){
        translate_obj = result;
        /*--------替换所有单词-----------------*/
        varNodes.forEach(function(node){
            node.name = translate_obj[node.name]||node.name;
        })
        refNodes.forEach(function(node){
            node.name = translate_obj[node.name]||node.name;
        })
        //console.log("编译前：")
        //console.log(source_code)
        callback(null,ast_code.print_to_string({
            beautify:true
        }));

    })
}



