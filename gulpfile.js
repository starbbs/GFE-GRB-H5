// 张树垚 2016-03-29 13:37:22 创建
// 微信H5 --- gulp命令

'use strict';


const gulp = require('gulp');
const path = require('path');

const tools = require('../gulp/tools');
const pkg = require('./package.json');

const PATH_BATH = '../../..';
const H5_FACTORY = PATH_BATH + '/' + pkg.name + '/factory';
const paths = {
	dest: { // gulp目录
		common: '../source', // 共用资源
		factory: './factory', // 工厂目录
		pages: './factory/pages', // 页面目录
		views: './factory/views', // 分页目录
		dialogs: './factory/dialogs', // 浮层目录
		components: './factory/components', // 组件目录
		source: './source', // 自用资源
		font: './source/font', // 字体目录
		build: './build', // 本地目录
		public: './public', // 线上目录
	},
	require: { // rjs目录
		name: pkg.name,
		PATH_LIBRARY: PATH_BATH + '/source/library',
		H5_FACTORY: H5_FACTORY,
		H5_VIEWS: H5_FACTORY + '/views',
		H5_COMPONENTS: H5_FACTORY + '/components',
		H5_DIALOGS: H5_FACTORY + '/dialogs',
		H5_PAGES: H5_FACTORY + '/pages',
		H5_SOURCE: H5_FACTORY + '/source',
	},
};

let amd;


gulp.task('require-config', function() { // 生成页面requirejs的config.js

	let replace = require('gulp-replace');
	let rename = require('gulp-rename');

	// 里面的占位符都是相对于页面路径的
	let sourceAMD = require('../source/package.json').amd;
	let h5AMD = pkg.amd;

	let amd = tools.combine(sourceAMD, h5AMD);

	return gulp.src('./require.config')
		.pipe(replace('{{amd}}', JSON.stringify(amd)))
		.pipe(rename('config.js'))
		.pipe(gulp.dest('./'))
		.pipe(tools.notify('require-config 配置完毕!'))
});

gulp.task('rjs', function() {
	return gulp.src('./aaa')
});



gulp.task('default', function() {

	return gulp.src('./aaa', function() {
		console.log(arguments)
	})

	let sourceAMD = require('../source/package.json').amd;
	let h5AMD = pkg.amd;

	let amd = tools.combine(sourceAMD, h5AMD);
	let res = tools.replaceholder(amd, paths);

	console.log(res);

	return gulp.src('/').pipe(tools.notify('111'));
});