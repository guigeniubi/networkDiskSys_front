<template>
    <div>
      <input type="file" @change="handleFileChange" />
      <button @click="startUpload" :disabled="uploading">开始上传</button>
      <div v-if="uploading">上传进度: {{ progress }}%</div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        file: null,
        uploading: false,
        progress: 0,
      };
    },
    methods: {
      handleFileChange(e) {
        this.file = e.target.files[0];
      },
      async startUpload() {
        if (!this.file) {
          alert("请选择文件");
          return;
        }
  
        this.uploading = true;
        const chunkSize = 1024 * 1024; // 分片大小，这里设置为 1MB
        const totalChunks = Math.ceil(this.file.size / chunkSize);
        let uploadedChunks = 0;
  
        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, this.file.size);
          const chunk = this.file.slice(start, end);
  
          // 模拟上传过程，实际场景需要调用后端接口上传分片
          await this.uploadChunk(chunk);
  
          uploadedChunks++;
          this.progress = Math.floor((uploadedChunks / totalChunks) * 100);
        }
  
        this.uploading = false;
        alert("上传完成");
      },
      uploadChunk(chunk) {
        // 模拟上传分片，实际情况下需要调用后端接口上传分片数据
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000); // 模拟延迟
        });
      },
    },
  };
  </script>
  