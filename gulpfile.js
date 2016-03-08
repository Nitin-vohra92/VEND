var gulp=require('gulp'); 
var nodemon=require('gulp-nodemon');

gulp.task('default',function(){
	nodemon({
		script: 'app.js',
		ext:'js',
		env:{
			PORT: 8000
		}
	})
	.on('restart',function(){
		console.log('Restarted!!');
	});
});