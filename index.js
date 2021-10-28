'use strict';

const packageJson = require('./package.json');
const FS = require('fs');
const PATH = require('path');
const constants = {
	DIRECTORY: 'directory',
	FILE: 'file'
}
//const ChangePath = require('node-path-changer').changeNodePath('new/node/path');

function safeReadDirSync (path) {
	let dirData = {};
	try {
		dirData = FS.readdirSync(path);
	} catch(ex) {
		if (ex.code == "EACCES" || ex.code == "EPERM")
			//User does not have permissions, ignore directory
			return null;
		else throw ex;
	}
	return dirData;
}

function normalizePath(path) {
	return path.replace(/\\/g, '/');
}

function isRegExp(regExp) {
	return typeof regExp === "object" && regExp.constructor == RegExp;
}

function directoryTree (path, options, onEachFile, onEachDirectory) {
	const name = PATH.basename(path);
	path = options && options.normalizePath ? normalizePath(path) : path;
	const item = { path, name };
	let stats;

	try { stats = FS.statSync(path); }
	catch (e) { return null; }

	// Skip if it matches the exclude regex
	if (options && options.exclude) {
		const excludes =  isRegExp(options.exclude) ? [options.exclude] : options.exclude;
		if (excludes.some((exclusion) => exclusion.test(path))) {
			return null;
		}
	}

	if (stats.isFile()) {
		
		const ext = PATH.extname(path).toLowerCase();
		
		// Skip if it does not match the extension regex
		if (options && options.extensions && !options.extensions.test(ext))
			return null;

		item.size = stats.size;  // File size in bytes
		item.extension = ext;
		item.type = constants.FILE;

		if (options && options.attributes) {
			options.attributes.forEach((attribute) => {
				item[attribute] = stats[attribute];
			});
		}

		if (onEachFile) {
			onEachFile(item, PATH);
		}
	}
	else if (stats.isDirectory()) {
		let dirData = safeReadDirSync(path);
		if (dirData === null) return null;

		if (options && options.attributes) {
			options.attributes.forEach((attribute) => {
				item[attribute] = stats[attribute];
			});
		}

		item.children = dirData
			.map(child => directoryTree(PATH.join(path, child), options, onEachFile, onEachDirectory))
			.filter(e => !!e);
		item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
		item.type = constants.DIRECTORY;
		if (onEachDirectory) {
			onEachDirectory(item, PATH, stats);
		}
	} else {
		return null; // Or set item.size = 0 for devices, FIFO and sockets ?
	}
	return item;
}

// module.exports = directoryTree;

// *** 연수원 사이트 경로 *** //
const fileName = './worksheet.html';
const stream = FS.createWriteStream(fileName);
const tree = directoryTree('html', {exclude:[]});

let li = '';
function getEl(children) {
	for (let index = 0; index < children.length; index++) {
		const element = children[index];
		if (element.type === 'directory') {
			li += '<li class="folder"><span class="item">'+ element.name +'</span>';
		} else {
			if(element.extension == '.html') {
				li += '<li class="html"><a href="'+ element.path +'" class="item" target="_blank">'+ element.name +'</a>';
			} else if(element.extension == '.css') {
				li += '<li class="css"><a href="'+ element.path +'" class="item" target="_blank">'+ element.name +'</a>';
			} else if(element.extension == '.js') {
				li += '<li class="js"><a href="'+ element.path +'" class="item" target="_blank">'+ element.name +'</a>';
			}
		}
		if (element.children) {
			li += '<ul>';
			getEl(element.children);
			li += '</ul>';
		}
		li += '</li>';
	}
}
getEl(tree.children);

function buildHtml() {
	const header = '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html{font-family:"Noto Sans","Noto Sans CJK KR",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"}body{margin:0}article,aside,details,figcaption,figure,footer,header,hgroup,main,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{text-decoration:none;background:0 0}a:active,a:hover{outline:0}a:focus,a:hover{text-decoration:underline}a:focus{outline:thin dotted;outline:5px auto -webkit-focus-ring-color;outline-offset:-2px}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}img{border:0}svg:not(:root){overflow:hidden}figure{margin:1em 40px}hr{-moz-box-sizing:content-box;box-sizing:content-box;height:0}pre{overflow:auto}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}button{overflow:visible}button,select{text-transform:none}button,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}button[disabled],html input[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}input{line-height:normal}input[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}input[type=search]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0}textarea{overflow:auto}optgroup{font-weight:700}table{border-collapse:collapse;border-spacing:0}td,th{padding:0}ol,ul{list-style:none;margin:0;padding:0}h1,h2,h3,h4,h5,h6,p{margin:0}.caret{display:inline-block;width:0;height:0;vertical-align:middle;border-top:6px solid;border-right:6px solid transparent;border-left:6px solid transparent}.caret-up{display:inline-block;width:0;height:0;vertical-align:middle;border-top:0;border-bottom:6px solid;border-right:6px solid transparent;border-left:6px solid transparent}.btn-top{display:none;position:fixed;right:15px;bottom:15px;width:40px;height:40px;line-height:36px;text-align:center;font-size:12px;color:#fff;background:#000;-webkit-transition:all .2s ease-in-out;transition:all .2s ease-in-out;z-index:99999;border-radius:5px;opacity:.7}.btn-top .caret-up{border-bottom:8px solid;border-right:8px solid transparent;border-left:8px solid transparent}.btn-top:hover{opacity:1;text-decoration:none}#header{padding:15px 0;text-align:center;background:#303e49}#header h1{margin-bottom:5px;color:#fff;font-size:24px;font-weight:600}#header .date{color:#96b2c8}#header .expand-control{margin-top:5px}#header .expand-control button{font-size:12px;padding:5px 10px;border-radius:3px;border:1px solid #0a0e11;background:#1b242b;color:#6a8294}.btn-link{margin:0 10px;text-decoration:underline;color:#2085c5}.btn-folder{position:absolute;top:10px;left:2px;width:40px;height:40px;padding:0;font-size:11px;color:#fff;border:0;background:#444;border-radius:50%;z-index:2;cursor:pointer}.btn-folder:before{content:"";position:absolute;left:50%;bottom:16px;width:0;height:0;margin-left:-8px;border-top:0;border-bottom:10px solid #fff;border-left:8px solid transparent;border-right:8px solid transparent;opacity:.5}.btn-folder.closed:before{content:"";position:absolute;left:50%;bottom:13px;width:0;height:0;margin-left:-8px;border-bottom:0;border-top:10px solid #fff;border-left:8px solid transparent;border-right:8px solid transparent;opacity:.5}.tree{margin:0 15px}ul{position:relative;list-style:none;font-size:16px}ul:before{content:"";position:absolute;top:0;left:21px;width:2px;height:100%;background-color:rgba(0,0,0,.1)}li{position:relative;min-height:40px;padding:10px 0 10px 55px;color:#555}li:before{content:"";position:absolute;top:28px;left:40px;width:15px;height:2px;background-color:rgba(0,0,0,.1)}li:after{content:"+";position:absolute;top:10px;left:2px;width:40px;height:40px;line-height:40px;text-align:center;font-size:11px;color:#fff;background:#000;border-radius:50%}li.folder:after{content:"";background:#444}li.html:after{content:"HTML";background:#548abc}li.ajax:after{content:"AJAX";background:#c36c95}li.json:after{content:"JSON";background:#bc6cc3}li.xml:after{content:"XML";background:#d09968}li.popup:after{content:"POP";background:#54b1bc}li.css:after{content:"CSS";background:#b08ce6}li.js:after{content:"JS";background:#a5bc54}li a{color:#000}li a:hover{color:red}li .item{display:inline-block;padding:7px 10px;color:#000;border:1px solid #ccc;background-color:#ccc}li a.item{border:1px dashed #ccc;background-color:transparent}li a.item:hover{border-color:#666;background-color:#f5f5f5;text-decoration:none}li .date{display:inline-block;white-space:nowrap;margin:5px 0 0 10px;font-size:12px;color:#777}li .comment{margin-top:7px;padding:10px;font-size:12px;border:1px solid #e1e1e8;background:#f7f7f9}li .comment pre{margin-top:10px}</style>';
	let bodyHeader = '<div id="header"><h1>'+packageJson.name+'</h1><div class="expand-control"><button type="button" class="toggle-expand">모두 접기</button></div></div>';
	let body = '<ul class="tree">';
	body += li;
	body += '</ul>';
	const footer = `<script src="http://code.jquery.com/jquery-3.4.1.min.js"></script><script>$(function(){$(".folder").prepend('<button type="button"class="btn-folder"></button>'),$(".btn-folder").click(function(){var e = $(this).parent().children("ul");e.is(":hidden") ? ($(this).removeClass("closed"),e.show()):($(this).addClass("closed"),e.hide())}),$(".toggle-expand").click(function(){$(this).hasClass("hide-all") ? ($(this).text("모두 접기"),$(this).removeClass("hide-all"),$(".btn-folder").removeClass("closed"),$(".btn-folder").parent().children("ul").show()):($(this).text("모두 펼치기"),$(this).addClass("hide-all"),$(".btn-folder").addClass("closed"),$(".btn-folder").parent().children("ul").hide())}),$("body").append('<a href="#"class="btn-top"><i class="caret-up"></i></a>'),$(window).scroll(function(e){$(window).scrollTop() > 300 ? $(".btn-top").show():$(".btn-top").hide()})});</script>`;
  return '<!DOCTYPE html>' + '<html><head>' + header + '</head><body>' + bodyHeader + body + footer + '</body></html>';
};

stream.once('open', function(fd) {
	const html = buildHtml();
	stream.end(html);
});