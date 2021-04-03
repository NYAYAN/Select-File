(function () {
  if (typeof NY == "undefined") {
    NY = { FilePlugin: { config: {}, files: [] } };
  } else {
    NY.FilePlugin = { config: {}, files: [] };
  }

  window.onload = function () {
    var fileInputs = document.querySelectorAll(".ny-file");
    var key = 100001;
    fileInputs.forEach(function (item, index) {
      item.value = "";
      item.dataset.key = key;
      var prop = {
        index: index, //index
        key: key++, //file upload key
        type: item.dataset.type, // selected | append
        size: undefined, //single file (byte) => (1MB - 1048576 byte)
        totalSize: undefined, //all file
        totalSizeIsValid: undefined, //all file
        mimeTypes: undefined, //file extension
      };

      if (item.dataset.size !== undefined) {
        var size = parseInt(item.dataset.size);
        if (size) {
          prop.size = size;
        }
      }

      if (item.dataset.totalSize !== undefined) {
        var totalSize = parseInt(item.dataset.totalSize);
        if (size) {
          prop.totalSize = totalSize;
        }
      }
      if (item.dataset.mimeType !== undefined) {
        prop.mimeTypes = item.dataset.mimeType.split(",");
      }

      NY.FilePlugin.files.push(prop);
      item.addEventListener("change", function (e) {
        e.preventDefault();
        changeTrigger(this, this.files);
        this.value = "";
      });
    });

    function changeTrigger(item, files) {
      var selectedFileEl = document.querySelectorAll(
        'ul.selectedFiles[data-key="' + item.dataset.key + '"]'
      );

      if (selectedFileEl.length == 0) {
        selectedFileEl = document.createElement("ul");
        selectedFileEl.classList.add("selectedFiles");
        selectedFileEl.dataset.key = item.dataset.key;
        item.parentNode.appendChild(selectedFileEl);
      }
      FillList(item.dataset.key, files);
    }

    function FillList(key, files) {
      var filteredData = NY.FilePlugin.files.filter(function (item) {
        return item.key == key;
      });

      if (filteredData.length == 0) return;
      filteredData = filteredData[0];

      if (filteredData.files === undefined || filteredData.type !== "append") {
        filteredData.files = [];
        NY.FilePlugin.files[filteredData.index].files = [];
      }

      for (file of files) {
        NY.FilePlugin.files[filteredData.index].files.push(file);
      }

      fileValidation(filteredData);
      htmlGenerate(NY.FilePlugin.files[filteredData.index]);
      return filteredData;
    }

    function htmlGenerate(data) {
      var selectedFileEl = document.querySelectorAll(
        "ul.selectedFiles[data-key='" + data.key + "']"
      );

      if (selectedFileEl.length == 0) {
        return;
      }
      selectedFileEl = selectedFileEl[0];
      selectedFileEl.innerHTML = "";

      data.files.forEach(function (file, index) {
        var removeSpanEl = document.createElement("span");
        removeSpanEl.classList.add("remove");
        removeSpanEl.innerHTML = NY.FilePlugin.config.icons.cancel;
        removeSpanEl.dataset.index = index;
        removeSpanEl.dataset.key = data.key;
        removeFile_Event(removeSpanEl);

        var nameEl = document.createElement("span");
        nameEl.classList.add("name");
        nameEl.innerText = file.name;

        var sizeEl = document.createElement("span");
        sizeEl.classList.add("size");
        sizeEl.innerText = getReadableFileSizeString(file.size);

        var liEl = document.createElement("li");
        if (file.isValid == false) {
          liEl.classList.add("danger");
        } else {
          liEl.classList.add("success");
        }

        liEl.appendChild(nameEl);
        liEl.appendChild(sizeEl);
        liEl.appendChild(removeSpanEl);

        selectedFileEl.appendChild(liEl);
      });
    }

    function removeFile_Event(removeEl) {
      removeEl.addEventListener("click", function (e) {
        var key = this.dataset.key;
        var index = this.dataset.index;

        var data = NY.FilePlugin.files.filter(function (item) {
          if (item.key == key) {
            item.files.splice(index, 1);
            return item;
          }
        });

        if (data.length > 0) {
          data = data[0];
          fileValidation(data);
          htmlGenerate(data);
        }
      });
    }

    function fileValidation(data) {
      var totalFilesSize = 0;
      for (file of data.files) {
        //Size Control
        file.isValid = true;
        if (data.size != undefined) {
          if (data.size < file.size) {
            file.isValid = false;
          }
        }

        //Mime Control
        if (data.mimeTypes !== undefined && file.isValid == true) {
          var fileType = file.name.split(".");
          if (fileType.length > 0) {
            var mime = fileType[fileType.length - 1];
            if (data.mimeTypes.indexOf(mime) == -1) {
              file.isValid = false;
            }
          } else {
            file.isValid = false;
          }
        }
        totalFilesSize += file.size;
      }

      //Total Size Control
      if (data.totalSize != undefined) {
        if (data.totalSize < totalFilesSize) {
          NY.FilePlugin.files[data.index].totalSizeIsValid = false;
        } else {
          NY.FilePlugin.files[data.index].totalSizeIsValid = true;
        }
      }
    }

    function getReadableFileSizeString(size) {
      var i = -1;
      do {
        size = size / 1024;
        i++;
      } while (size > 1024);
      return Math.max(size, 0.1).toFixed(2) + NY.FilePlugin.config.byteUnits[i];
    }

    NY.FilePlugin.config.byteUnits = [
      " kB",
      " MB",
      " GB",
      " TB",
      "PB",
      "EB",
      "ZB",
      "YB",
    ];

    NY.FilePlugin.config.icons = {
      cancel:
        '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512.001 512.001" style="width:32px; height:32px;" xml:space="preserve"> <path d="M405.6,69.6C360.7,24.7,301.1,0,237.6,0s-123.1,24.7-168,69.6S0,174.1,0,237.6s24.7,123.1,69.6,168s104.5,69.6,168,69.6s123.1-24.7,168-69.6s69.6-104.5,69.6-168S450.5,114.5,405.6,69.6z M386.5,386.5c-39.8,39.8-92.7,61.7-148.9,61.7s-109.1-21.9-148.9-61.7c-82.1-82.1-82.1-215.7,0-297.8C128.5,48.9,181.4,27,237.6,27s109.1,21.9,148.9,61.7C468.6,170.8,468.6,304.4,386.5,386.5z"/> <path d="M342.3,132.9c-5.3-5.3-13.8-5.3-19.1,0l-85.6,85.6L152,132.9c-5.3-5.3-13.8-5.3-19.1,0c-5.3,5.3-5.3,13.8,0,19.1l85.6,85.6l-85.6,85.6c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4l85.6-85.6l85.6,85.6c2.6,2.6,6.1,4,9.5,4c3.5,0,6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1l-85.4-85.6l85.6-85.6C347.6,146.7,347.6,138.2,342.3,132.9z"/> </svg>',
    };
  };
})(window);
