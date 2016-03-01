var gulp = require('gulp');
var fileinclude = require('gulp-file-include');
var Stream = require('stream');
var fs = require('fs');

function Devutils(){
    this.generateIncludeFile = function(relativePath,filePath){

        var self = this;

        var stream = new Stream.Writable({objectMode:true});
        self.file = fs.createWriteStream(filePath);

        stream._write = function(file,encoding,callback){
            self.file.write(genScripTag(relativePath + file.relative.toString().replace(/\\/g,'/')) + '\n');
            callback();
        };

        stream.end = function(){
            doInclude();
        };

        return stream;

    };

    var doInclude = function(){
        var stream = new Stream.Writable({objectMode:true});

        gulp.src(['app/templates/index.html'])
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
            .pipe(gulp.dest('app/'));
        return stream;
    };


    function genScripTag(src){
        return  '  <script src="' + src + '"></script>';
    }
}

module.exports = new Devutils();