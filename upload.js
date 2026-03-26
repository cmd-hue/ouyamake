
var dragndrop;
var progress;
var progressBg;
var progressBar;
var progressBarText;
var completeScreen;
var error;
var errorScreen;
var bigerror;
var internalSpace = "internalSpace";
var externalSpace = "externalSpace";

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function uploadFiles(files) {
	var data = new FormData();
	var xhr = new XMLHttpRequest();

	var count = 0;
	if(files.length != 1) {
		error.text("Please provide one APK");
		error.show();
		return;
	}
	if(endsWith(files[0].name, "apk")) {
	    var size = 0;
	    if('size' in files[0]) {
	        size = files[0].size;
	    } else if('fileSize' in files[0]) {
	        size = files[0].fileSize;
	    }
	    if(size > internalSpace) {
	        if(size < externalSpace) {
	            $("p", bigerror).text("Oops, right now we have to load your apk to internal storage and then move it to external. We'll need you to free up more internal space to make this work. Look for improvements to this in the future.");
	            bigerror.show();
	        } else {
	            error.text("Not enough space available!")
	            error.show();
            }
	        return;
	    }
        data.append('apk', files[0]);
        count++;
	}
	if(count == 0) {
		error.text("APKs only, please!");
		error.show();
		return;
	}
	
	xhr.open('POST', '/upload');

	progressBar.width(0);
	
	xhr.onload = function() {
		progress.hide();
		completeScreen.show();
	};

	if("upload" in new XMLHttpRequest) {
		xhr.upload.onprogress = function(event) {
			if(event.lengthComputable) {
				var complete = (event.loaded / event.total);
				progressBar.width(progressBg.width() * complete);
				var percent = Math.round(complete * 100, 2);
				progressBarText.text(percent + "%");

				if(percent == 100) {
					progressBar.addClass("indefinite");
					$("span", progress).text("Completing upload, this may take a minute...");
				}
			}
		};

		xhr.upload.onerror = function(event) {
		    progress.hide();
		    errorScreen.show();
		};
	}

	xhr.send(data);

	dragndrop.hide();
	progress.show();
}

$(document).ready(function() {
	var manual = $("#manual");
	dragndrop = $("#dragndrop");
	var dropzone = $("#dropzone");
	var dropzonetext = $("#dragndrop > span");
	progress = $("#progress");
	progressBar = $("#progressbar");
	progressBg = $("#progressbarbg");
	progressBarText = $("#progressbartext");
	completeScreen = $("#complete");
	error = $("#error");
	errorScreen = $("#errorScreen");
	bigerror = $("#bigerror");

	$("#close", bigerror).click(function() {
	    bigerror.hide();
	});

	if('draggable' in document.createElement('span')) {
		dropzone.on('dragover', function(event) {
			error.hide();
			event.preventDefault();
			if(!dropzone.hasClass('hover')) {
				dropzone.addClass('hover');
				dropzonetext.addClass('hover');
			}
		});
		
		dropzone.on('dragleave', function(event) {
			event.preventDefault();
			dropzone.removeClass('hover');
			dropzonetext.removeClass('hover');
		});

		dropzone.on('drop', function(event) {
			event.preventDefault();
			dropzone.removeClass('hover');
			dropzonetext.removeClass('hover');
			uploadFiles(event.originalEvent.dataTransfer.files);
		});

		dragndrop.show();
	} else {
		manual.show();
	}
});