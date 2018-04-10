import request = require('request');

let localIp = `http://118.31.72.227`;
export let Get = (url: string, query?: any): Promise<any> => {
    if (!url.startsWith('http')) {
        url = localIp + url
    }
    return new Promise(resolve => {
        let urlPath = `?`;
        let queryStr: string = ''
        if (query) {
            for (let key in query) {
                if (!queryStr) queryStr += `${key}=${query[key]}`;
                else {
                    queryStr += `&${key}=${query[key]}`
                }
            }
        }
        request(url + urlPath + queryStr, (err, res, body) => {
            if (err) resolve(false);
            else {
                resolve(JSON.parse(body));
            }
        })
    });
}
export let Post = (url: string, body: any, query?: any): Promise<any> => {
    if (!url.startsWith('http')) {
        url = localIp + url
    }
    let queryStr: string = ''
    if (query) {
        for (let key in query) {
            if (!queryStr) queryStr += `${key}=${query[key]}`;
            else {
                queryStr += `&${key}=${query[key]}`
            }
        }
    }

    url = url + `?` + queryStr
    return new Promise(resolve => {
        post(url, body, (data) => {
            resolve(JSON.parse(data));
        })
    })
}

export function post(url, data, fn) {
    console.log(url)
    data = data || {};
    var content = require('querystring').stringify(data);
    var parse_u = require('url').parse(url, true);
    var isHttp = parse_u.protocol == 'http:';
    var options = {
        host: parse_u.hostname,
        port: parse_u.port || (isHttp ? 80 : 443),
        path: parse_u.path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': content.length
        }
    };
    var req = require(isHttp ? 'http' : 'https').request(options, function (res) {
        var _data = '';
        res.on('data', function (chunk) {
            _data += chunk;
        });
        res.on('end', function () {
            fn != undefined && fn(_data);
        });
    });
    req.write(content);
    req.end();
}