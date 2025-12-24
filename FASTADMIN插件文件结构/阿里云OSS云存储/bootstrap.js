if (typeof Config.upload.storage !== 'undefined' && Config.upload.storage === 'r2') {
    require(['upload'], function (Upload) {
        //获取文件MD5值
        var getFileMd5 = function (file, cb) {
            //如果savekey中未检测到md5，则无需获取文件md5，直接返回upload的uuid
            if (!Config.upload.savekey.match(/\{(file)?md5\}/)) {
                cb && cb(file.upload.uuid);
                return;
            }
            require(['../addons/alioss/js/spark'], function (SparkMD5) {
                var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
                    chunkSize = 10 * 1024 * 1024,
                    chunks = Math.ceil(file.size / chunkSize),
                    currentChunk = 0,
                    spark = new SparkMD5.ArrayBuffer(),
                    fileReader = new FileReader();

                fileReader.onload = function (e) {
                    spark.append(e.target.result);
                    currentChunk++;
                    if (currentChunk < chunks) {
                        loadNext();
                    } else {
                        cb && cb(spark.end());
                    }
                };

                fileReader.onerror = function () {
                    console.warn('文件读取错误');
                };

                function loadNext() {
                    var start = currentChunk * chunkSize,
                        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

                    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
                }

                loadNext();

            });
        };

        var _onInit = Upload.events.onInit;
        //初始化中完成判断
        Upload.events.onInit = function () {
            _onInit.apply(this, Array.prototype.slice.apply(arguments));
            //如果上传接口不是R2，则不处理
            if (this.options.url !== Config.upload.uploadurl && Config.upload.uploadmode !== 'client') {
                return;
            }
            $.extend(this.options, {
                //关闭自动处理队列功能
                autoQueue: false,
                params: function (files, xhr, chunk) {
                    var params = Config.upload.multipart;
                    if (chunk) {
                        return $.extend({}, params, {
                            filesize: chunk.file.size,
                            filename: chunk.file.name,
                            chunkid: chunk.file.upload.uuid,
                            chunkindex: chunk.index,
                            chunkcount: chunk.file.upload.totalChunkCount,
                            chunksize: this.options.chunkSize,
                            chunkfilesize: chunk.dataBlock.data.size,
                            width: chunk.file.width || 0,
                            height: chunk.file.height || 0,
                            type: chunk.file.type,
                            uploadId: chunk.file.uploadId,
                            key: chunk.file.key,
                        });
                    } else {
                        params = $.extend({}, params, files[0].params);
                        params.category = files[0].category || '';
                    }
                    return params;
                },
                chunkSuccess: function (chunk, file, response) {
                    // S3返回的ETag在响应头中
                    var etag = chunk.xhr.getResponseHeader("ETag");
                    if (etag) {
                        etag = etag.replace(/(^")|("$)/g, '');
                    } else {
                        // 如果没有ETag，尝试从响应中获取
                        etag = response || '';
                    }
                    file.etags = file.etags ? file.etags : [];
                    file.etags[chunk.index] = etag;
                },
                chunksUploaded: function (file, done) {
                    var that = this;
                    Fast.api.ajax({
                        url: "/addons/r2/index/upload",
                        data: {
                            action: 'merge',
                            filesize: file.size,
                            filename: file.name,
                            chunkid: file.upload.uuid,
                            chunkcount: file.upload.totalChunkCount,
                            md5: file.md5,
                            key: file.key,
                            uploadId: file.uploadId,
                            etags: file.etags,
                            category: file.category || '',
                            r2token: Config.upload.multipart.r2token,
                        },
                    }, function (data, ret) {
                        done(JSON.stringify(ret));
                        return false;
                    }, function (data, ret) {
                        file.accepted = false;
                        that._errorProcessing([file], ret.msg);
                        return false;
                    });

                },
            });

            var _success = this.options.success;
            //先移除已有的事件
            this.off("success", _success).on("success", function (file, response) {
                var ret = {code: 0, msg: response};
                try {
                    if (response) {
                        ret = typeof response === 'string' ? JSON.parse(response) : response;
                    }
                    if (file.xhr && file.xhr.status === 200) {
                        if (Config.upload.uploadmode === 'client') {
                            ret = {code: 1, data: {url: '/' + file.key}};
                            var url = ret.data.url || '';

                            Fast.api.ajax({
                                url: "/addons/r2/index/notify",
                                data: {name: file.name, url: url, md5: file.md5, size: file.size, width: file.width || 0, height: file.height || 0, type: file.type, category: file.category || '', r2token: Config.upload.multipart.r2token}
                            }, function () {
                                return false;
                            }, function () {
                                return false;
                            });
                        }
                    } else {
                        console.error(file.xhr);
                    }
                } catch (e) {
                    console.error(e);
                }
                _success.call(this, file, ret);
            });

            this.on("addedfile", function (file) {
                var that = this;
                setTimeout(function () {
                    if (file.status === 'error') {
                        return;
                    }
                    getFileMd5(file, function (md5) {
                        var chunk = that.options.chunking && file.size > that.options.chunkSize ? 1 : 0;
                        var params = $(that.element).data("params") || {};
                        var category = typeof params.category !== 'undefined' ? params.category : ($(that.element).data("category") || '');
                        category = typeof category === 'function' ? category.call(that, file) : category;
                        Fast.api.ajax({
                            url: "/addons/r2/index/params",
                            data: {method: 'POST', category: category, md5: md5, name: file.name, type: file.type, size: file.size, chunk: chunk, chunksize: that.options.chunkSize, r2token: Config.upload.multipart.r2token},
                        }, function (data) {
                            file.md5 = md5;
                            file.id = data.id;
                            file.key = data.key;
                            file.url = data.url; // presigned URL
                            file.uploadId = data.uploadId;
                            file.partUrls = data.partUrls || [];
                            file.params = data;
                            file.category = category;

                            if (file.status != 'error') {
                                //开始上传
                                that.enqueueFile(file);
                            } else {
                                that.removeFile(file);
                            }
                            return false;
                        }, function () {
                            that.removeFile(file);
                        });
                    });
                }, 0);
            });

            if (Config.upload.uploadmode === 'client') {
                var _method = this.options.method;
                var _url = this.options.url;
                this.options.method = function (files) {
                    if (files[0].upload.chunked) {
                        return "PUT";
                    }
                    return _method;
                };
                this.options.url = function (files) {
                    if (files[0].upload.chunked) {
                        var chunk = null;
                        files[0].upload.chunks.forEach(function (item) {
                            if (item.status === 'uploading') {
                                chunk = item;
                            }
                        });
                        if (chunk && files[0].partUrls && files[0].partUrls[chunk.index]) {
                            // 使用presigned URL
                            return files[0].partUrls[chunk.index];
                        }
                        // 如果没有presigned URL，回退到服务器中转
                        return Config.upload.uploadurl + "/" + files[0].key + "?partNumber=" + (chunk.index + 1) + "&uploadId=" + files[0].uploadId;
                    }
                    // 普通上传使用presigned URL
                    return files[0].url || _url;
                };
                this.on("sending", function (file, xhr, formData) {
                    var that = this;
                    if (file.upload.chunked) {
                        var _send = xhr.send;
                        xhr.send = function () {
                            var chunk = null;
                            file.upload.chunks.forEach(function (item) {
                                if (item.status == 'uploading') {
                                    chunk = item;
                                }
                            });
                            if (chunk) {
                                // S3需要直接发送文件数据，不需要formData
                                _send.call(xhr, chunk.dataBlock.data);
                            }
                        };
                    } else {
                        // 普通上传：直接发送文件Blob，不使用formData
                        // 注意：Dropzone/Upload库会自动处理文件上传，这里只需要确保使用正确的URL
                        // 如果需要手动发送，可以使用以下代码：
                        var _send = xhr.send;
                        xhr.send = function () {
                            // 获取文件的Blob对象
                            var fileBlob = file;
                            if (file.upload && file.upload.file) {
                                fileBlob = file.upload.file;
                            } else if (file instanceof File) {
                                fileBlob = file;
                            }
                            _send.call(xhr, fileBlob);
                        };
                    }
                });
            }
        };
    });
}
