var appid = '20160225000013404';
var key = 'MoSvTIgeJB7mR7oMEwde';


var request = require("request")
md5 = function(string) {
    var crypto, md5sum;
    crypto = require('crypto');
    md5sum = crypto.createHash('md5');
    md5sum.update(string, 'utf8');
    return md5sum.digest('hex');
};

var wordTransformTemp = {};
var splitBigWord = function(word){
    var tmp = "";
    var result = [];
    for(var i=0;i<word.length;i++){
        if(!/[A-Z]/.test(word.charAt(i))){
            tmp += word.charAt(i)
        }else{
            if(i>=1&&!/[A-Z]/.test(word.charAt(i-1))){
                (tmp!=="")&&result.push(tmp);
                tmp = "";
            }

            tmp += word.charAt(i)
        }

    }
    (tmp!=="")&&result.push(tmp)
    return result;
}
var transformWord = function(word){
    if(word.indexOf("_")!=-1){
        wordTransformTemp[word.replace(/_/g," ")] = word;
        return word.replace(/_/g," ");
    }
    if(/[A-Z]/.test(word)){
        var new_word = splitBigWord(word).join(" ");
        wordTransformTemp[new_word] = word;
        return new_word;
    }
    return word;
}

module.exports = function(strs,callback){
    var to_trans_words = []
    strs.forEach(function(str){
        to_trans_words.push(transformWord(str));
    })
    strs = to_trans_words.join("\n")
    var salt = (new Date).getTime();
    var query = strs;
    var from = 'en';
    var to = 'zh';
    var str1 = appid + query + salt +key;
    var sign = md5(str1);
    var qs = {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
    }
    request.get({
        url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        qs: {
            q: query,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        }
    },function(e,r,body){
        var result = {},res;
        try{
            res = JSON.parse(body);
            if(res.trans_result){
                res.trans_result.forEach(function(r){
                    var dst = r.dst.replace(/ /g,"_");
                    result[wordTransformTemp[r.src]||r.src] = dst;
                })
            }
        }catch(e){

        }
        callback(null,result);
    });
}
